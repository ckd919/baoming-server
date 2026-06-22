-- ===================================================
-- V4: 管理员邀请 token
-- ===================================================
ALTER TABLE activities ADD COLUMN IF NOT EXISTS admin_invite_token VARCHAR(64);
