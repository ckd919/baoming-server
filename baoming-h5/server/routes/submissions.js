/**
 * 报名提交路由: 公开提交 + 管理查看
 */
import { Router } from 'express';
import pool from '../db.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = Router();

// ---- 工具函数 ----

/** 检测请求是否来自微信浏览器 */
function isWeChatBrowser(req) {
  const ua = (req.headers['user-agent'] || '').toLowerCase();
  return ua.includes('micromessenger');
}

/** Token 验证逻辑，返回 null 表示通过，否则返回错误响应 */
async function validateAccess(activityId, token, req) {
  const result = await pool.query(
    `SELECT invite_token, wechat_only, status FROM activities WHERE id = $1`,
    [activityId]
  );

  if (result.rows.length === 0) {
    return { status: 404, error: '活动不存在' };
  }

  const act = result.rows[0];

  if (act.status !== 'published') {
    return { status: 400, error: '活动未开放报名' };
  }

  // 检查微信浏览器限制
  if (act.wechat_only && !isWeChatBrowser(req)) {
    return { status: 403, error: '请在微信中打开此链接' };
  }

  // 检查 token
  if (act.invite_token) {
    if (!token) {
      return { status: 403, error: '请从指定微信群获取报名链接' };
    }
    if (token !== act.invite_token) {
      return { status: 403, error: '报名链接已失效或不属于本群' };
    }
  }

  return null; // 验证通过
}

// ---- 公开接口（无需登录）----

// GET /api/form/:activityId  — 获取公开报名页的活动信息
router.get('/form/:activityId', async (req, res) => {
  try {
    const token = req.query.token || '';

    const result = await pool.query(
      `SELECT id, name, description, location, start_time, end_time,
              max_participants, status, fields, submission_count,
              invite_token, wechat_only
       FROM activities
       WHERE id = $1 AND status = 'published'`,
      [req.params.activityId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '活动不存在或未发布' });
    }

    const row = result.rows[0];

    // token 验证
    if (row.invite_token && token !== row.invite_token) {
      return res.status(403).json({
        error: row.invite_token ? '报名链接无效，请联系群管理员获取正确链接' : '活动不存在或未发布',
        requireToken: true,
      });
    }

    // 微信浏览器检测
    if (row.wechat_only && !isWeChatBrowser(req)) {
      return res.status(403).json({
        error: '请在微信中打开此链接进行报名',
        requireWechat: true,
      });
    }

    res.json({
      activity: {
        id: row.id,
        name: row.name,
        description: row.description,
        location: row.location,
        startTime: row.start_time ? parseInt(row.start_time) : null,
        endTime: row.end_time ? parseInt(row.end_time) : null,
        maxParticipants: row.max_participants,
        status: row.status,
        fields: row.fields || [],
        submissionCount: row.submission_count,
        requireToken: !!row.invite_token,
        wechatOnly: row.wechat_only === true,
      },
    });
  } catch (err) {
    console.error('获取公开活动错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// POST /api/form/:activityId/submit  — 用户报名提交
router.post('/form/:activityId/submit', async (req, res) => {
  try {
    const { id, data, submittedAt, groupId, token } = req.body;

    // 检查活动是否已发布 + token 验证
    const actResult = await pool.query(
      `SELECT id, max_participants, submission_count, status,
              allowed_groups, invite_token, wechat_only
       FROM activities WHERE id = $1`,
      [req.params.activityId]
    );

    if (actResult.rows.length === 0) {
      return res.status(404).json({ error: '活动不存在' });
    }

    const act = actResult.rows[0];
    if (act.status !== 'published') {
      return res.status(400).json({ error: '活动未开放报名' });
    }
    if (act.max_participants > 0 && act.submission_count >= act.max_participants) {
      return res.status(400).json({ error: '报名人数已满' });
    }

    // 微信浏览器检测
    if (act.wechat_only && !isWeChatBrowser(req)) {
      return res.status(403).json({ error: '请在微信中打开此链接进行报名' });
    }

    // token 验证（优先于 allowed_groups）
    if (act.invite_token) {
      if (!token || token !== act.invite_token) {
        return res.status(403).json({ error: '报名链接无效，请联系群管理员获取正确链接' });
      }
    }

    // 微信群白名单校验（旧机制，兼容保留）
    if (!act.invite_token && act.allowed_groups && Array.isArray(act.allowed_groups) && act.allowed_groups.length > 0) {
      if (!groupId) {
        return res.status(403).json({ error: '请从指定微信群进入报名' });
      }
      if (!act.allowed_groups.includes(groupId)) {
        return res.status(403).json({ error: '您所在的群不在报名范围内' });
      }
    }

    // 插入提交记录
    await pool.query(
      `INSERT INTO submissions (id, activity_id, data, submitted_at)
       VALUES ($1, $2, $3, $4)`,
      [id, req.params.activityId, JSON.stringify(data || {}), submittedAt || Date.now()]
    );

    // 更新计数
    await pool.query(
      'UPDATE activities SET submission_count = submission_count + 1 WHERE id = $1',
      [req.params.activityId]
    );

    res.json({ ok: true, id });
  } catch (err) {
    console.error('报名提交错误:', err);
    res.status(500).json({ error: '提交失败' });
  }
});

// ---- 管理接口（需要登录）----

// GET /api/activities/:activityId/submissions  — 查看报名数据
router.get('/activities/:activityId/submissions', requireAuth, async (req, res) => {
  try {
    // 确认活动属于该用户
    const actResult = await pool.query(
      'SELECT id FROM activities WHERE id = $1 AND user_id = $2',
      [req.params.activityId, req.user.id]
    );
    if (actResult.rows.length === 0) {
      return res.status(403).json({ error: '无权限访问' });
    }

    const result = await pool.query(
      'SELECT id, data, submitted_at FROM submissions WHERE activity_id = $1 ORDER BY submitted_at DESC',
      [req.params.activityId]
    );

    const submissions = result.rows.map(row => ({
      id: row.id,
      data: row.data || {},
      submittedAt: row.submitted_at ? parseInt(row.submitted_at) : null,
    }));

    res.json({ submissions });
  } catch (err) {
    console.error('获取报名数据错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// DELETE /api/activities/:activityId/submissions  — 清空报名数据
router.delete('/activities/:activityId/submissions', requireAuth, async (req, res) => {
  try {
    await pool.query(
      `DELETE FROM submissions WHERE activity_id = $1
       AND activity_id IN (SELECT id FROM activities WHERE user_id = $2)`,
      [req.params.activityId, req.user.id]
    );
    await pool.query(
      'UPDATE activities SET submission_count = 0 WHERE id = $1',
      [req.params.activityId]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: '服务器错误' });
  }
});

export default router;
