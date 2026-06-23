/**
 * 小棕熊预约报名 H5 - Node.js 后端入口
 * Express + PostgreSQL
 */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import activityRoutes from './routes/activities.js';
import submissionRoutes from './routes/submissions.js';
import templateRoutes from './routes/templates.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ---- 中间件 ----
app.use(cors());
app.use(express.json({ limit: '10mb' }));  // 支持 base64 图片

// ---- 路由 ----
app.use('/api/auth', authRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api', submissionRoutes);           // /api/form/:id, /api/form/:id/submit

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// ---- 启动 ----
app.listen(PORT, () => {
  console.log(`🚀 小棕熊预约报名后端已启动: http://localhost:${PORT}`);
  console.log(`📊 API 文档:`);
  console.log(`   POST /api/auth/login          - 登录`);
  console.log(`   GET  /api/auth/me              - 当前用户`);
  console.log(`   GET  /api/activities           - 活动列表`);
  console.log(`   POST /api/activities           - 创建活动`);
  console.log(`   PUT  /api/activities/:id       - 更新活动`);
  console.log(`   DEL  /api/activities/:id       - 删除活动`);
  console.log(`   GET  /api/form/:id             - 公开报名页`);
  console.log(`   POST /api/form/:id/submit      - 提交报名`);
  console.log(`   GET  /api/activities/:id/submissions - 查看数据`);
});
