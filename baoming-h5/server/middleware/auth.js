/**
 * JWT 认证中间件
 * 验证请求头中的 Bearer Token
 */
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'baoming_jwt_secret_2024_key';

/** 生成 Token（有效期 7 天） */
export function generateToken(user) {
  return jwt.sign(
    { id: user.id, phone: user.phone },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/** 必须登录的中间件 */
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: '未登录，请先登录' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: '登录已过期，请重新登录' });
  }
}

/** 可选登录（不强制，但如果有 token 就解析） */
export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    } catch (e) { /* ignore */ }
  }
  next();
}
