-- ============================================
-- 数据库迁移脚本: 添加群组访问控制列
-- 在 psql 中执行: \i migrate.sql
-- ============================================

-- 添加 allow_share 列（如果不存在）
ALTER TABLE activities ADD COLUMN IF NOT EXISTS allow_share BOOLEAN DEFAULT true;

-- 添加 invite_token 列
ALTER TABLE activities ADD COLUMN IF NOT EXISTS invite_token VARCHAR(64);

-- 添加 verify_code 列（群验证码）
ALTER TABLE activities ADD COLUMN IF NOT EXISTS verify_code VARCHAR(20) DEFAULT '';

-- 添加 wechat_only 列
ALTER TABLE activities ADD COLUMN IF NOT EXISTS wechat_only BOOLEAN DEFAULT false;

-- 添加 allowed_groups 列
ALTER TABLE activities ADD COLUMN IF NOT EXISTS allowed_groups JSONB DEFAULT '[]';

-- 添加 users 表的 openid 列（支持微信登录绑定）
ALTER TABLE users ADD COLUMN IF NOT EXISTS openid VARCHAR(64);

SELECT 'Migration completed successfully' AS status;
