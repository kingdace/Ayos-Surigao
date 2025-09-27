-- Admin Panel Seeder Data
-- This script creates default admin accounts for the system

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

-- Insert sample barangay admin accounts (only if they don't exist)
-- Password: Barangay123! (hashed with bcrypt)
-- Note: barangay_code is set to NULL since we don't know which barangays exist
INSERT INTO admin_accounts (
  email, 
  password_hash, 
  first_name, 
  last_name, 
  role, 
  barangay_code,
  is_active
) VALUES 
(
  'barangay001@ayossurigao.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- Barangay123!
  'Barangay',
  'Admin 1',
  'barangay_admin',
  NULL, -- Will be set later when barangay is assigned
  true
),
(
  'barangay002@ayossurigao.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- Barangay123!
  'Barangay',
  'Admin 2',
  'barangay_admin',
  NULL, -- Will be set later when barangay is assigned
  true
),
(
  'barangay003@ayossurigao.com',
  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- Barangay123!
  'Barangay',
  'Admin 3',
  'barangay_admin',
  NULL, -- Will be set later when barangay is assigned
  true
)
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
SELECT 'Admin seeder data created successfully!' as status;
