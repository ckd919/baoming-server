/**
 * 活动路由: CRUD
 */
import { Router } from 'express';
import pool from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// ---- 所有活动接口都需要登录 ----
router.use(requireAuth);

// GET /api/activities  — 获取我的活动列表（支持状态筛选+关键词搜索）
router.get('/', async (req, res) => {
  try {
    const { status, keyword, page = 1, count = 50 } = req.query;
    const conditions = ['user_id = $1', "status != 'deleted'"];
    const values = [req.user.id];
    let idx = 2;

    if (status && status !== 'all') {
      conditions.push(`status = $${idx}`);
      values.push(status);
      idx++;
    }
    if (keyword) {
      conditions.push(`name ILIKE $${idx}`);
      values.push(`%${keyword}%`);
      idx++;
    }

    const where = conditions.join(' AND ');
    const offset = (parseInt(page) - 1) * parseInt(count);
    const limit = parseInt(count);

    const result = await pool.query(
      `SELECT id, name, description, location, start_time, end_time,
              max_participants, status, fields, submission_count,
              created_at, updated_at, allow_share, invite_token, verify_code, wechat_only, allowed_groups
       FROM activities WHERE ${where}
       ORDER BY updated_at DESC
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...values, limit, offset]
    );

    // 转换字段名（数据库用下划线，前端用驼峰）
    const activities = result.rows.map(row => ({
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
      allowShare: row.allow_share !== false,
      inviteToken: row.invite_token || '',
      verifyCode: row.verify_code || '',
      wechatOnly: row.wechat_only === true,
      allowedGroups: row.allowed_groups || [],
      createdAt: row.created_at ? parseInt(row.created_at) : null,
      updatedAt: row.updated_at ? parseInt(row.updated_at) : null,
    }));

    res.json({ activities });
  } catch (err) {
    console.error('获取活动列表错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// GET /api/activities/:id  — 获取单个活动
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM activities WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '活动不存在' });
    }
    const row = result.rows[0];
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
        allowShare: row.allow_share !== false,
        inviteToken: row.invite_token || '',
        verifyCode: row.verify_code || '',
        wechatOnly: row.wechat_only === true,
        allowedGroups: row.allowed_groups || [],
        createdAt: row.created_at ? parseInt(row.created_at) : null,
        updatedAt: row.updated_at ? parseInt(row.updated_at) : null,
      },
    });
  } catch (err) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// POST /api/activities  — 创建活动
router.post('/', async (req, res) => {
  try {
    const {
      id, name, description, location, startTime, endTime,
      maxParticipants, status, fields, allowShare, inviteToken, wechatOnly, allowedGroups, createdAt, updatedAt,
    } = req.body;

    await pool.query(
      `INSERT INTO activities (id, user_id, name, description, location,
        start_time, end_time, max_participants, status, fields, allow_share,
        invite_token, wechat_only, allowed_groups, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
      [
        id, req.user.id, name, description || '', location || '',
        startTime, endTime, maxParticipants || 0, status || 'draft',
        JSON.stringify(fields || []), allowShare !== false,
        inviteToken || null, wechatOnly === true,
        JSON.stringify(allowedGroups || []), createdAt || Date.now(), Date.now(),
      ]
    );

    res.json({ ok: true, id });
  } catch (err) {
    console.error('创建活动错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// PUT /api/activities/:id  — 更新活动
router.put('/:id', async (req, res) => {
  try {
    const updates = req.body;
    const fields = [];
    const values = [];
    let idx = 1;

    const mapping = {
      name: 'name',
      description: 'description',
      location: 'location',
      startTime: 'start_time',
      endTime: 'end_time',
      maxParticipants: 'max_participants',
      status: 'status',
      submissionCount: 'submission_count',
      allowShare: 'allow_share',
      inviteToken: 'invite_token',
      wechatOnly: 'wechat_only',
    };

    for (const [key, col] of Object.entries(mapping)) {
      if (updates[key] !== undefined) {
        fields.push(`${col} = $${idx}`);
        values.push(updates[key]);
        idx++;
      }
    }

    // fields 是 JSONB
    if (updates.fields !== undefined) {
      fields.push(`fields = $${idx}`);
      values.push(JSON.stringify(updates.fields));
      idx++;
    }

    // allowedGroups 是 JSONB
    if (updates.allowedGroups !== undefined) {
      fields.push(`allowed_groups = $${idx}`);
      values.push(JSON.stringify(updates.allowedGroups));
      idx++;
    }

    // updated_at
    fields.push(`updated_at = $${idx}`);
    values.push(Date.now());
    idx++;

    values.push(req.params.id, req.user.id);

    await pool.query(
      `UPDATE activities SET ${fields.join(', ')} WHERE id = $${idx} AND user_id = $${idx + 1}`,
      values
    );

    res.json({ ok: true });
  } catch (err) {
    console.error('更新活动错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// DELETE /api/activities/:id  — 软删除活动（移入回收站）
router.delete('/:id', async (req, res) => {
  try {
    await pool.query(
      "UPDATE activities SET status = 'deleted' WHERE id = $1 AND user_id = $2",
      [req.params.id, req.user.id]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// POST /api/activities/:id/restore  — 从回收站恢复
router.post('/:id/restore', async (req, res) => {
  try {
    await pool.query(
      "UPDATE activities SET status = 'draft' WHERE id = $1 AND user_id = $2",
      [req.params.id, req.user.id]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// DELETE /api/activities/:id/permanent  — 永久删除
router.delete('/:id/permanent', async (req, res) => {
  try {
    await pool.query('DELETE FROM activities WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// POST /api/activities/batch-export  — 批量导出
router.post('/batch-export', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !ids.length) return res.status(400).json({ error: '请选择要导出的活动' });

    const result = await pool.query(
      `SELECT a.id, a.name, a.submission_count,
              COALESCE(json_agg(json_build_object(
                'id', s.id, 'data', s.data, 'submittedAt', s.submitted_at
              )) FILTER (WHERE s.id IS NOT NULL), '[]') as submissions
       FROM activities a
       LEFT JOIN submissions s ON s.activity_id = a.id
       WHERE a.id = ANY($1) AND a.user_id = $2
       GROUP BY a.id`,
      [ids, req.user.id]
    );

    res.json({ activities: result.rows });
  } catch (err) {
    console.error('批量导出错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// POST /api/activities/:id/regenerate-token  — 重新生成邀请 token
router.post('/:id/regenerate-token', async (req, res) => {
  try {
    const crypto = await import('crypto');
    const newToken = crypto.randomBytes(24).toString('hex');

    const result = await pool.query(
      'UPDATE activities SET invite_token = $1, updated_at = $2 WHERE id = $3 AND user_id = $4 RETURNING invite_token',
      [newToken, Date.now(), req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '活动不存在' });
    }

    res.json({ inviteToken: newToken });
  } catch (err) {
    console.error('重新生成 token 错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

export default router;
