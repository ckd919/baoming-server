/**
 * 认证路由: 登录、注册、获取用户信息
 */
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../db.js';
import { generateToken, requireAuth } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ error: '请输入手机号和密码' });
    }

    const result = await pool.query(
      'SELECT id, phone, password, nickname FROM users WHERE phone = $1',
      [phone]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: '手机号或密码错误' });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(401).json({ error: '手机号或密码错误' });
    }

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user.id,
        phone: user.phone,
        nickname: user.nickname,
      },
    });
  } catch (err) {
    console.error('登录错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

// GET /api/auth/me  — 获取当前用户
router.get('/me', requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, phone, nickname FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: '用户不存在' });
    }
    res.json({ user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: '服务器错误' });
  }
});

// POST /api/auth/wechat-login  — 微信手机号登录
router.post('/wechat-login', async (req, res) => {
  try {
    const { code, encryptedData, iv, nickname, avatarUrl } = req.body;

    if (!code || !encryptedData || !iv) {
      return res.status(400).json({ error: '参数不全' });
    }

    // 调用微信API获取session_key
    const APP_ID = process.env.WX_APPID || 'wxa0606d69df5b21f0';
    const APP_SECRET = process.env.WX_APPSECRET || '';
    const wxRes = await fetch(
      `https://api.weixin.qq.com/sns/jscode2session?appid=${APP_ID}&secret=${APP_SECRET}&js_code=${code}&grant_type=authorization_code`
    );
    const wxData = await wxRes.json();

    if (wxData.errcode) {
      return res.status(400).json({ error: '微信登录失败: ' + wxData.errmsg });
    }

    // 解密手机号
    const crypto = await import('crypto');
    const sessionKey = Buffer.from(wxData.session_key, 'base64');
    const encrypted = Buffer.from(encryptedData, 'base64');
    const ivBuf = Buffer.from(iv, 'base64');

    let decoded;
    try {
      const decipher = crypto.createDecipheriv('aes-128-cbc', sessionKey, ivBuf);
      decipher.setAutoPadding(true);
      let decrypted = decipher.update(encrypted, 'binary', 'utf8');
      decrypted += decipher.final('utf8');
      decoded = JSON.parse(decrypted);
    } catch (decryptErr) {
      return res.status(400).json({ error: '解密失败' });
    }

    const phone = decoded.purePhoneNumber || decoded.phoneNumber || '';
    if (!phone) {
      return res.status(400).json({ error: '未获取到手机号' });
    }

    // 用 openid 作为用户唯一标识
    const openid = wxData.openid;
    const existing = await pool.query('SELECT id, phone, nickname, openid FROM users WHERE openid = $1', [openid]);
    let user;
    if (existing.rows.length > 0) {
      user = existing.rows[0];
      // 更新手机号、昵称
      await pool.query(
        `UPDATE users SET phone = $1, nickname = COALESCE(NULLIF($2,''), nickname) WHERE id = $3`,
        [phone, nickname, user.id]
      );
    } else {
      // 也查一下手机号是否已存在（旧账号迁移）
      const phoneUser = await pool.query('SELECT id, phone, nickname, openid FROM users WHERE phone = $1 AND openid IS NULL', [phone]);
      if (phoneUser.rows.length > 0) {
        user = phoneUser.rows[0];
        await pool.query(
          `UPDATE users SET openid = $1, nickname = COALESCE(NULLIF($2,''), nickname) WHERE id = $3`,
          [openid, nickname, user.id]
        );
      } else {
        const newUser = await pool.query(
          `INSERT INTO users (phone, password, nickname, openid) VALUES ($1, '', $2, $3) RETURNING id, phone, nickname`,
          [phone, nickname || '微信用户', openid]
        );
        user = newUser.rows[0];
      }
    }

    const token = generateToken(user);
    res.json({ token, user: { id: user.id, phone: user.phone, nickname: user.nickname } });
  } catch (err) {
    console.error('微信登录错误:', err);
    res.status(500).json({ error: '服务器错误' });
  }
});

export default router;
