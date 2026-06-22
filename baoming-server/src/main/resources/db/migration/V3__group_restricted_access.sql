-- ===================================================
-- V3: 群限制访问 + 表单填写需登录
-- ===================================================

-- 1. activities 新增 group_restricted 字段
ALTER TABLE activities ADD COLUMN IF NOT EXISTS group_restricted BOOLEAN DEFAULT false;

-- 2. 索引优化
CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(status);
