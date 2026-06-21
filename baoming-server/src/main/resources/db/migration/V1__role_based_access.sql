-- ===================================================
-- 数据库迁移: 角色权限分离 + 报名用户追踪
-- ===================================================

-- 1. 添加 role 列到 users 表
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(10) DEFAULT 'USER';

-- 2. 将现有管理员用户标记为 ADMIN
--    默认管理员手机号: 13310843925
UPDATE users SET role = 'ADMIN' WHERE phone = '13310843925';

-- 3. 设置 role 列为 NOT NULL（先设默认值再改）
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'USER';
ALTER TABLE users ALTER COLUMN role SET NOT NULL;

-- 4. password 改为可空（USER 角色无需密码）
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;

-- 5. submissions 表添加 user_id 和 phone 列
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS user_id INTEGER;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS phone VARCHAR(11);

-- 6. 添加外键约束（如果不存在）
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_submissions_user_id'
    ) THEN
        ALTER TABLE submissions ADD CONSTRAINT fk_submissions_user_id
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- 7. 添加索引以优化查询
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_phone ON submissions(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
