-- ============================================
-- 报名工具 H5 - PostgreSQL 数据库初始化脚本
-- 在 psql 中执行: \i init.sql
-- ============================================

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id          SERIAL PRIMARY KEY,
    phone       VARCHAR(11) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,
    nickname    VARCHAR(50) DEFAULT '',
    created_at  TIMESTAMP DEFAULT NOW()
);

-- 活动表
CREATE TABLE IF NOT EXISTS activities (
    id              VARCHAR(20) PRIMARY KEY,
    user_id         INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(200) NOT NULL,
    description     TEXT DEFAULT '',
    location        VARCHAR(500) DEFAULT '',
    start_time      BIGINT,
    end_time        BIGINT,
    max_participants INTEGER DEFAULT 0,
    status          VARCHAR(20) DEFAULT 'draft',
    fields          JSONB DEFAULT '[]',
    submission_count INTEGER DEFAULT 0,
    allow_share     BOOLEAN DEFAULT true,
    invite_token    VARCHAR(64),
    verify_code     VARCHAR(20) DEFAULT '',
    wechat_only     BOOLEAN DEFAULT false,
    allowed_groups  JSONB DEFAULT '[]',
    created_at      BIGINT,
    updated_at      BIGINT
);

-- 报名提交表
CREATE TABLE IF NOT EXISTS submissions (
    id           VARCHAR(20) PRIMARY KEY,
    activity_id  VARCHAR(20) REFERENCES activities(id) ON DELETE CASCADE,
    data         JSONB DEFAULT '{}',
    submitted_at BIGINT
);

-- 插入默认用户 (密码 bcrypt 加密后的 Aled2239)
INSERT INTO users (phone, password, nickname)
VALUES ('13310843925', '$2a$10$iLmfU0YBe2KTXv8VvBRpkuSF3FK31fwbgMBKOa8mYgDzPwIN/CCsK', '管理员')
ON CONFLICT (phone) DO NOTHING;
