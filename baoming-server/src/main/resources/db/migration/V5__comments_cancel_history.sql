-- ===================================================
-- V5: 留言 + 取消审核 + 管理员历史 + 一键截止/开启 + 通知
-- ===================================================

-- 1. 活动留言表
CREATE TABLE IF NOT EXISTS activity_comments (
    id          SERIAL PRIMARY KEY,
    activity_id VARCHAR(20) NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content     TEXT NOT NULL,
    created_at  BIGINT NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_ac_activity ON activity_comments(activity_id);

-- 2. 取消报名申请表
CREATE TABLE IF NOT EXISTS cancel_requests (
    id            SERIAL PRIMARY KEY,
    submission_id VARCHAR(20) NOT NULL,
    activity_id   VARCHAR(20) NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason        TEXT DEFAULT '',
    status        VARCHAR(20) DEFAULT 'pending',  -- pending/approved/rejected
    reviewed_by   INTEGER,
    reviewed_at   BIGINT,
    created_at    BIGINT NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_cr_activity ON cancel_requests(activity_id);
CREATE INDEX IF NOT EXISTS idx_cr_user ON cancel_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_cr_status ON cancel_requests(status);

-- 3. 管理员历史记录表
CREATE TABLE IF NOT EXISTS admin_history (
    id           SERIAL PRIMARY KEY,
    owner_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    admin_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at   BIGINT NOT NULL DEFAULT 0,
    UNIQUE(owner_id, admin_id)
);
CREATE INDEX IF NOT EXISTS idx_ah_owner ON admin_history(owner_id);

-- 4. 活动原始截止时间（一键恢复用）
ALTER TABLE activities ADD COLUMN IF NOT EXISTS original_end_time BIGINT;
