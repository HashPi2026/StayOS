-- ============================================================================
-- StayOS PMS Migration: 004_user_login_credential.sql
-- Description: Creates user_login_credential table and seeds SuperAdmin user & role
-- ============================================================================

-- 1. Table: user_login_credential
CREATE TABLE IF NOT EXISTS public.user_login_credential (
  credential_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES public.app_user(user_id) ON DELETE CASCADE,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  login_email VARCHAR(255),
  password_hash VARCHAR(255) NOT NULL,
  password_salt VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Ensure login_email can be null if previously added with NOT NULL
ALTER TABLE public.user_login_credential ALTER COLUMN login_email DROP NOT NULL;

-- Index for rapid login lookup
CREATE INDEX IF NOT EXISTS idx_user_login_credential_username ON public.user_login_credential(username);
CREATE INDEX IF NOT EXISTS idx_user_login_credential_email ON public.user_login_credential(email);
CREATE INDEX IF NOT EXISTS idx_user_login_credential_user_id ON public.user_login_credential(user_id);

-- 2. Insert SuperAdmin Role into role_privilege (if not present)
INSERT INTO public.role_privilege (role_id, client_id, role_name, short_name, role_type, description)
VALUES (
  3, 
  'PROP_DEMO_001', 
  'SuperAdmin', 
  'SuperAdmin', 
  'SUPER_ADMIN', 
  'Super Administrator with unrestricted access to all PMS modules, properties, and system configurations'
)
ON CONFLICT (role_id) DO UPDATE SET
  role_name = EXCLUDED.role_name,
  role_type = EXCLUDED.role_type,
  description = EXCLUDED.description;

-- 3. Grant ALL 11 modules to SuperAdmin (role_id = 3)
INSERT INTO public.role_module_access (role_id, module_key)
VALUES 
  (3, 'dashboard'),
  (3, 'reservation'),
  (3, 'front_desk'),
  (3, 'rate_availability'),
  (3, 'audit'),
  (3, 'business_channels'),
  (3, 'guest'),
  (3, 'housekeeping'),
  (3, 'utility'),
  (3, 'reports'),
  (3, 'configuration')
ON CONFLICT DO NOTHING;

-- 4. Create Super Admin User in app_user (if not present)
INSERT INTO public.app_user (user_id, client_id, role_id, user_name, description, is_active)
VALUES (
  3, 
  'PROP_DEMO_001', 
  3, 
  'Super Admin', 
  'Global Super Administrator with full access to all PMS modules and properties', 
  true
)
ON CONFLICT (user_id) DO UPDATE SET
  role_id = EXCLUDED.role_id,
  user_name = EXCLUDED.user_name,
  is_active = EXCLUDED.is_active;

-- 5. Seed credentials for SuperAdmin
-- Default password: SuperAdmin@2026!
INSERT INTO public.user_login_credential (user_id, username, email, password_hash, password_salt, is_active)
VALUES (
  3,
  'superadmin',
  'superadmin@stayos.com',
  'fae446d3e62a7d47f98e82103f7e651e70e3f4384b6da808a38779eb46d0a799ed61c16cefa61f308ee4e9d0388e36465457ef0c16999be3feeb0f4133405786',
  '7b6d1948ba42ad5d1fa823bb3fa79075',
  true
)
ON CONFLICT (user_id) DO UPDATE SET
  username = EXCLUDED.username,
  email = EXCLUDED.email,
  password_hash = EXCLUDED.password_hash,
  password_salt = EXCLUDED.password_salt,
  is_active = EXCLUDED.is_active;
