-- ManualHub PostgreSQL Initial Migration for Neon
-- Version: 001_initial.sql

-- Enable pgcrypto extension for gen_random_uuid() if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 2. Create manuals table
CREATE TABLE IF NOT EXISTS manuals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  project TEXT NOT NULL,
  revision TEXT NOT NULL,
  description TEXT,
  current_version INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- 3. Create manual_versions table
CREATE TABLE IF NOT EXISTS manual_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manual_id UUID NOT NULL REFERENCES manuals(id) ON DELETE CASCADE,
  revision TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
  drive_id TEXT,
  item_id TEXT,
  file_name TEXT,
  mime_type TEXT,
  file_size BIGINT
);

-- 4. Create public_links table
CREATE TABLE IF NOT EXISTS public_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manual_id UUID NOT NULL REFERENCES manuals(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ,
  password_hash TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- 5. Create access_logs table
CREATE TABLE IF NOT EXISTS access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID NOT NULL REFERENCES public_links(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'download', 'preview', 'link_created', 'link_disabled')),
  ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Indexes for optimal querying performance
CREATE INDEX IF NOT EXISTS idx_manuals_company ON manuals(company);
CREATE INDEX IF NOT EXISTS idx_manuals_project ON manuals(project);
CREATE INDEX IF NOT EXISTS idx_manual_versions_manual_id ON manual_versions(manual_id);
CREATE INDEX IF NOT EXISTS idx_public_links_token ON public_links(token);
CREATE INDEX IF NOT EXISTS idx_access_logs_link_id ON access_logs(link_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_created_at ON access_logs(created_at);

-- Insert Master User (SUP) if not exists
-- Password "T1el#@!" hashed via PBKDF2-SHA512
INSERT INTO users (id, name, email, password_hash, role, active)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Super Administrador',
  'SUP',
  '67498549546061e504ee05d4427a0cb8d167d1ee9f3c5589e0367398612452eeb646ab1395f82bbb50eaaa9ec69a528bad0a30dd418dd29915191fcadb3a545c',
  'superadmin',
  true
)
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash;
