-- ===================================================
-- 数据库迁移 V2: 管理员管理 + 分享权限等级 + 微信授权登录
-- ===================================================

-- 1. users 表新增 openid 和 avatar_url
ALTER TABLE users ADD COLUMN IF NOT EXISTS openid VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500) DEFAULT '';

-- 2. phone 改为可选（支持仅 openid 登录）
ALTER TABLE users ALTER COLUMN phone DROP NOT NULL;

-- 3. 添加索引
CREATE INDEX IF NOT EXISTS idx_users_openid ON users(openid);

-- 4. activities 表新增 share_level（替代增强 allow_share）
ALTER TABLE activities ADD COLUMN IF NOT EXISTS share_level VARCHAR(20) DEFAULT 'all';
-- 迁移现有数据: allow_share=false -> share_level='creator'
UPDATE activities SET share_level = 'creator' WHERE allow_share = false AND share_level = 'all';

-- 5. 创建活动管理员关联表
CREATE TABLE IF NOT EXISTS activity_admins (
    id          SERIAL PRIMARY KEY,
    activity_id VARCHAR(20) NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role        VARCHAR(20) DEFAULT 'admin',
    created_at  BIGINT NOT NULL DEFAULT 0,
    UNIQUE(activity_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_aa_activity ON activity_admins(activity_id);
CREATE INDEX IF NOT EXISTS idx_aa_user ON activity_admins(user_id);
