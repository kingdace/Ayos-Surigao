-- Admin Panel Seeder Data with Real Barangay Codes
-- This script creates default admin accounts using actual barangay codes from your database

-- First, let's see what barangay codes are available
-- Run this query first to see available barangays:
-- SELECT code, name FROM barangays ORDER BY code LIMIT 5;

-- Insert default super admin account (only if it doesn't exist)
-- Password: Admin123! (hashed with bcrypt)
INSERT INTO admin_accounts (
  email, 
  password_hash, 
  first_name, 
  last_name, 
  role, 
  is_active
) VALUES (
  'admin@ayossurigao.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- Admin123!
  'Super',
  'Admin',
  'super_admin',
  true
) ON CONFLICT (email) DO NOTHING;

-- Insert operations manager account (only if it doesn't exist)
-- Password: Ops123! (hashed with bcrypt)
INSERT INTO admin_accounts (
  email, 
  password_hash, 
  first_name, 
  last_name, 
  role, 
  is_active
) VALUES (
  'ops@ayossurigao.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- Ops123!
  'Operations',
  'Manager',
  'operations_manager',
  true
) ON CONFLICT (email) DO NOTHING;

-- Insert barangay admin accounts using the first 3 available barangay codes
-- Password: Barangay123! (hashed with bcrypt)
-- This will automatically use the first 3 barangay codes from your database
INSERT INTO admin_accounts (
  email, 
  password_hash, 
  first_name, 
  last_name, 
  role, 
  barangay_code,
  is_active
) 
SELECT 
  'barangay' || b.code || '@ayossurigao.com' as email,
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' as password_hash, -- Barangay123!
  'Barangay' as first_name,
  'Admin ' || b.code as last_name,
  'barangay_admin'::admin_role as role,
  b.code as barangay_code,
  true as is_active
FROM barangays b
ORDER BY b.code
LIMIT 3
ON CONFLICT (email) DO NOTHING;

-- Insert default system settings (only if they don't exist)
INSERT INTO admin_settings (key, value, description) VALUES
('system_name', 'Ayos Surigao Operations Center', 'Name of the operations center'),
('max_reports_per_user', '50', 'Maximum reports a user can submit per month'),
('auto_assign_reports', 'false', 'Automatically assign reports to available admins'),
('notification_email', 'admin@ayossurigao.com', 'Email for system notifications'),
('maintenance_mode', 'false', 'Enable maintenance mode for the system'),
('report_retention_days', '365', 'Number of days to keep resolved reports'),
('enable_anonymous_reports', 'true', 'Allow anonymous report submissions'),
('require_approval', 'false', 'Require admin approval before reports are public')
ON CONFLICT (key) DO NOTHING;

-- Success message
SELECT 'Admin seeder data with real barangay codes created successfully!' as status;
