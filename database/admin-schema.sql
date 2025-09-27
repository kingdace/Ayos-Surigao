-- Admin Panel Database Schema
-- This script creates all necessary tables and functions for the admin system

-- Create admin role enum (only if it doesn't exist)
DO $$ BEGIN
    CREATE TYPE admin_role AS ENUM (
      'super_admin',
      'operations_manager', 
      'barangay_admin',
      'field_coordinator',
      'data_analyst'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Admin accounts table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS admin_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role admin_role NOT NULL DEFAULT 'operations_manager',
  barangay_code VARCHAR(10) REFERENCES barangays(code),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Report assignments table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS report_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES admin_accounts(id),
  assigned_by UUID REFERENCES admin_accounts(id),
  status VARCHAR(50) DEFAULT 'assigned',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Report status history for audit trail (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS report_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  old_status VARCHAR(50),
  new_status VARCHAR(50),
  changed_by UUID REFERENCES admin_accounts(id),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Admin comments on reports (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS admin_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES admin_accounts(id),
  comment TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false, -- Internal notes vs public comments
  created_at TIMESTAMP DEFAULT NOW()
);

-- System settings table (only if it doesn't exist)
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  updated_by UUID REFERENCES admin_accounts(id),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_admin_accounts_email ON admin_accounts(email);
CREATE INDEX IF NOT EXISTS idx_admin_accounts_role ON admin_accounts(role);
CREATE INDEX IF NOT EXISTS idx_admin_accounts_active ON admin_accounts(is_active);
CREATE INDEX IF NOT EXISTS idx_report_assignments_report_id ON report_assignments(report_id);
CREATE INDEX IF NOT EXISTS idx_report_assignments_assigned_to ON report_assignments(assigned_to);
CREATE INDEX IF NOT EXISTS idx_report_status_history_report_id ON report_status_history(report_id);
CREATE INDEX IF NOT EXISTS idx_admin_comments_report_id ON admin_comments(report_id);

-- Enable RLS on admin tables
ALTER TABLE admin_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_accounts
DROP POLICY IF EXISTS "Admins can view all admin accounts" ON admin_accounts;
CREATE POLICY "Admins can view all admin accounts" ON admin_accounts
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Super admins can insert admin accounts" ON admin_accounts;
CREATE POLICY "Super admins can insert admin accounts" ON admin_accounts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_accounts 
      WHERE id = auth.uid()::uuid 
      AND role = 'super_admin'
    )
  );

DROP POLICY IF EXISTS "Super admins can update admin accounts" ON admin_accounts;
CREATE POLICY "Super admins can update admin accounts" ON admin_accounts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admin_accounts 
      WHERE id = auth.uid()::uuid 
      AND role = 'super_admin'
    )
  );

-- RLS Policies for report_assignments
DROP POLICY IF EXISTS "Admins can view all assignments" ON report_assignments;
CREATE POLICY "Admins can view all assignments" ON report_assignments
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can create assignments" ON report_assignments;
CREATE POLICY "Admins can create assignments" ON report_assignments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_accounts 
      WHERE id = auth.uid()::uuid 
      AND is_active = true
    )
  );

DROP POLICY IF EXISTS "Admins can update assignments" ON report_assignments;
CREATE POLICY "Admins can update assignments" ON report_assignments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admin_accounts 
      WHERE id = auth.uid()::uuid 
      AND is_active = true
    )
  );

-- RLS Policies for report_status_history
DROP POLICY IF EXISTS "Admins can view all status history" ON report_status_history;
CREATE POLICY "Admins can view all status history" ON report_status_history
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can insert status history" ON report_status_history;
CREATE POLICY "Admins can insert status history" ON report_status_history
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_accounts 
      WHERE id = auth.uid()::uuid 
      AND is_active = true
    )
  );

-- RLS Policies for admin_comments
DROP POLICY IF EXISTS "Admins can view all comments" ON admin_comments;
CREATE POLICY "Admins can view all comments" ON admin_comments
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can create comments" ON admin_comments;
CREATE POLICY "Admins can create comments" ON admin_comments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_accounts 
      WHERE id = auth.uid()::uuid 
      AND is_active = true
    )
  );

DROP POLICY IF EXISTS "Admins can update their own comments" ON admin_comments;
CREATE POLICY "Admins can update their own comments" ON admin_comments
  FOR UPDATE USING (admin_id = auth.uid()::uuid);

-- RLS Policies for admin_settings
DROP POLICY IF EXISTS "Admins can view all settings" ON admin_settings;
CREATE POLICY "Admins can view all settings" ON admin_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Super admins can manage settings" ON admin_settings;
CREATE POLICY "Super admins can manage settings" ON admin_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_accounts 
      WHERE id = auth.uid()::uuid 
      AND role = 'super_admin'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
DROP TRIGGER IF EXISTS update_admin_accounts_updated_at ON admin_accounts;
CREATE TRIGGER update_admin_accounts_updated_at 
  BEFORE UPDATE ON admin_accounts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_report_assignments_updated_at ON report_assignments;
CREATE TRIGGER update_report_assignments_updated_at 
  BEFORE UPDATE ON report_assignments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to log report status changes
CREATE OR REPLACE FUNCTION log_report_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO report_status_history (report_id, old_status, new_status, changed_by)
        VALUES (NEW.id, OLD.status, NEW.status, auth.uid()::uuid);
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger for report status changes
DROP TRIGGER IF EXISTS log_report_status_change_trigger ON reports;
CREATE TRIGGER log_report_status_change_trigger
  AFTER UPDATE ON reports
  FOR EACH ROW EXECUTE FUNCTION log_report_status_change();

-- Success message
SELECT 'Admin database schema created successfully!' as status;
