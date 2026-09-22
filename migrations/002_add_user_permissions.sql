-- ManualHub Migration 002: Add granular permissions column to users table
-- Version: 002_add_user_permissions.sql

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{"can_view": true, "can_edit": true, "can_delete": true, "can_manage_users": true}'::jsonb;

-- Ensure superadmin user has full permissions
UPDATE users 
SET permissions = '{"can_view": true, "can_edit": true, "can_delete": true, "can_manage_users": true}'::jsonb
WHERE role = 'superadmin' OR email = 'SUP';
