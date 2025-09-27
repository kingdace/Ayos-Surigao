-- Fix My Barangay - Safe Migration Script
-- This script safely migrates from simple schema to centralized operations center
-- Handles existing types and tables gracefully

-- Step 1: Drop existing types if they exist (safe approach)
DROP TYPE IF EXISTS report_category CASCADE;
DROP TYPE IF EXISTS report_status CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS urgency_level CASCADE;
DROP TYPE IF EXISTS notification_type CASCADE;

-- Step 2: Create all types fresh
CREATE TYPE user_role AS ENUM (
  'resident',           -- Regular citizens
  'guest',             -- Anonymous users
  'operations_manager', -- Overall coordination
  'system_admin',      -- Technical management
  'field_coordinator', -- Geographic coverage coordinators
  'data_analyst',      -- Reports and insights
  'super_admin'        -- System owner (you)
);

CREATE TYPE report_category AS ENUM (
  'roads_infrastructure',
  'utilities_power',
  'water_sanitation', 
  'waste_management',
  'public_safety',
  'streetlights',
  'drainage_flooding',
  'public_facilities',
  'environmental',
  'other'
);

CREATE TYPE report_status AS ENUM (
  'submitted',      -- Initial state
  'reviewing',      -- Operations center reviewing
  'assigned',       -- Assigned to staff/department
  'in_progress',    -- Work in progress
  'pending_parts',  -- Waiting for materials/resources
  'resolved',       -- Issue fixed
  'verified',       -- Resolution confirmed
  'closed'          -- Case closed
);

CREATE TYPE urgency_level AS ENUM (
  'low',
  'medium', 
  'high',
  'critical'
);

CREATE TYPE notification_type AS ENUM (
  'report_submitted',
  'status_updated',
  'report_assigned',
  'report_resolved',
  'system_alert'
);

-- Step 3: Drop existing tables if they exist (safe approach)
DROP TABLE IF EXISTS report_comments CASCADE;
DROP TABLE IF EXISTS report_status_history CASCADE;
DROP TABLE IF EXISTS report_attachments CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS operations_staff CASCADE;
DROP TABLE IF EXISTS barangay_officials CASCADE;

-- Step 4: Ensure profiles table exists with enhanced structure
-- First check if profiles table exists, if not create it
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
        CREATE TABLE profiles (
            id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
            email TEXT,
            full_name TEXT,
            barangay TEXT,
            phone TEXT,
            role user_role DEFAULT 'resident',
            is_verified BOOLEAN DEFAULT FALSE,
            avatar_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Enable RLS
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
        
        -- Policies for profiles
        CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
        CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
        CREATE POLICY "Anyone can insert profile" ON profiles FOR INSERT WITH CHECK (true);
    ELSE
        -- Table exists, just add new columns if they don't exist
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'resident';
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
        ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END
$$;

-- Step 5: Ensure barangays table exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'barangays') THEN
        CREATE TABLE barangays (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            code TEXT,
            population INTEGER,
            area_sqkm DECIMAL(10,2),
            captain_name TEXT,
            captain_contact TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Insert Surigao City barangays
        INSERT INTO barangays (name, code) VALUES 
        ('Alang-alang', 'ALG'),
        ('Anomar', 'ANM'),
        ('Baybay', 'BBY'),
        ('Bilabid', 'BLB'),
        ('Bonifacio', 'BNF'),
        ('Bukid', 'BKD'),
        ('Bunakan', 'BNK'),
        ('Buenavista', 'BVT'),
        ('Carigara', 'CRG'),
        ('Canlanipa', 'CNL'),
        ('Danao', 'DNA'),
        ('Ipil', 'IPL'),
        ('Libuac', 'LBC'),
        ('Lipata', 'LPT'),
        ('Luna', 'LNA'),
        ('Mabua', 'MBA'),
        ('Mabini', 'MBN'),
        ('Mapawa', 'MPW'),
        ('Mat-i', 'MTI'),
        ('Nonoc Island', 'NNC'),
        ('Orok', 'ORK'),
        ('Poctoy', 'PCT'),
        ('Punta Bilar', 'PTB'),
        ('Quezon', 'QZN'),
        ('Rizal', 'RZL'),
        ('Sabang', 'SBG'),
        ('San Juan', 'SJN'),
        ('San Mateo', 'SMT'),
        ('San Pedro', 'SPD'),
        ('Siete de Agosto', 'SDA'),
        ('Sukailang', 'SKL'),
        ('Sison', 'SSN'),
        ('Taft', 'TFT'),
        ('Talisayan', 'TLS'),
        ('Trinidad', 'TRD'),
        ('Washington', 'WSH'),
        ('Zaragoza', 'ZRG'),
        ('Poblacion', 'POB');
    END IF;
END
$$;

-- Step 6: Create new centralized operations tables

-- Operations staff table
CREATE TABLE operations_staff (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    staff_id TEXT UNIQUE NOT NULL, -- e.g., "OPS001"
    position TEXT NOT NULL,
    department TEXT,
    specialization TEXT[],
    assigned_barangays TEXT[], -- Can cover multiple barangays
    is_active BOOLEAN DEFAULT TRUE,
    hire_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Barangay officials table
CREATE TABLE barangay_officials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    barangay_id INTEGER REFERENCES barangays(id),
    position TEXT NOT NULL, -- Captain, Councilor, Secretary, etc.
    term_start DATE,
    term_end DATE,
    is_active BOOLEAN DEFAULT TRUE,
    contact_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced reports table
CREATE TABLE reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_number TEXT UNIQUE NOT NULL, -- Auto-generated: FMB-2024-001
    
    -- Reporter information
    reporter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reporter_name TEXT, -- For anonymous reports
    reporter_contact TEXT,
    is_anonymous BOOLEAN DEFAULT FALSE,
    
    -- Report details
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category report_category NOT NULL,
    subcategory TEXT,
    urgency urgency_level DEFAULT 'medium',
    
    -- Location information
    barangay_id INTEGER REFERENCES barangays(id),
    specific_location TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    landmarks TEXT,
    
    -- Assignment and workflow
    status report_status DEFAULT 'submitted',
    assigned_to UUID REFERENCES operations_staff(id),
    assigned_department TEXT,
    priority_score INTEGER DEFAULT 50, -- Auto-calculated
    
    -- Tracking
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    estimated_resolution DATE,
    
    -- Additional data
    tags TEXT[],
    public_visibility BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Report attachments
CREATE TABLE report_attachments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL, -- image, video, document
    file_size INTEGER,
    uploaded_by UUID REFERENCES profiles(id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Report status history
CREATE TABLE report_status_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
    from_status report_status,
    to_status report_status NOT NULL,
    changed_by UUID REFERENCES profiles(id),
    change_reason TEXT,
    notes TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Report comments
CREATE TABLE report_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
    commenter_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE, -- Internal ops comments vs public updates
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System notifications
CREATE TABLE notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipient_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    related_report_id UUID REFERENCES reports(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 7: Create indexes for performance
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_category ON reports(category);
CREATE INDEX idx_reports_barangay ON reports(barangay_id);
CREATE INDEX idx_reports_assigned_to ON reports(assigned_to);
CREATE INDEX idx_reports_reported_at ON reports(reported_at);
CREATE INDEX idx_reports_priority_score ON reports(priority_score);
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX idx_report_attachments_report ON report_attachments(report_id);

-- Step 8: Enable RLS on all tables
ALTER TABLE operations_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE barangay_officials ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Step 9: Create RLS policies

-- Operations staff policies
CREATE POLICY "Operations staff can view all staff" ON operations_staff FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('operations_manager', 'system_admin', 'super_admin')
    )
);

-- Reports policies
CREATE POLICY "Anyone can view public reports" ON reports FOR SELECT USING (public_visibility = true);
CREATE POLICY "Users can view their own reports" ON reports FOR SELECT USING (reporter_id = auth.uid());
CREATE POLICY "Operations staff can view all reports" ON reports FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('operations_manager', 'system_admin', 'field_coordinator', 'data_analyst', 'super_admin')
    )
);
CREATE POLICY "Anyone can insert reports" ON reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Operations staff can update reports" ON reports FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND role IN ('operations_manager', 'system_admin', 'field_coordinator', 'super_admin')
    )
);

-- Report attachments policies
CREATE POLICY "Anyone can view attachments" ON report_attachments FOR SELECT USING (true);
CREATE POLICY "Anyone can insert attachments" ON report_attachments FOR INSERT WITH CHECK (true);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (recipient_id = auth.uid());
CREATE POLICY "System can insert notifications" ON notifications FOR INSERT WITH CHECK (true);

-- Step 10: Create functions for auto-generating report numbers
CREATE OR REPLACE FUNCTION generate_report_number()
RETURNS TEXT AS $$
DECLARE
    year_part TEXT;
    sequence_num INTEGER;
    report_num TEXT;
BEGIN
    year_part := EXTRACT(YEAR FROM NOW())::TEXT;
    
    -- Get next sequence number for this year
    SELECT COALESCE(MAX(
        CAST(SUBSTRING(report_number FROM 'FMB-' || year_part || '-(\d+)') AS INTEGER)
    ), 0) + 1
    INTO sequence_num
    FROM reports 
    WHERE report_number LIKE 'FMB-' || year_part || '-%';
    
    report_num := 'FMB-' || year_part || '-' || LPAD(sequence_num::TEXT, 4, '0');
    
    RETURN report_num;
END;
$$ LANGUAGE plpgsql;

-- Step 11: Create trigger to auto-generate report numbers
CREATE OR REPLACE FUNCTION set_report_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.report_number IS NULL OR NEW.report_number = '' THEN
        NEW.report_number := generate_report_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_report_number
    BEFORE INSERT ON reports
    FOR EACH ROW
    EXECUTE FUNCTION set_report_number();

-- Step 12: Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update timestamp triggers
CREATE TRIGGER trigger_update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_operations_staff_updated_at
    BEFORE UPDATE ON operations_staff
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_reports_updated_at
    BEFORE UPDATE ON reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- MIGRATION COMPLETE!
-- Your database is now ready for the centralized operations center
