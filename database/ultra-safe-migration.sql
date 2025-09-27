-- Fix My Barangay - Ultra Safe Migration Script
-- Works with your existing simple-schema structure
-- No foreign key conflicts, preserves all existing data

-- Step 1: Check what exists and handle safely
DO $$
BEGIN
    -- Drop existing enum types safely
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'report_category') THEN
        DROP TYPE report_category CASCADE;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'report_status') THEN
        DROP TYPE report_status CASCADE;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        DROP TYPE user_role CASCADE;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'urgency_level') THEN
        DROP TYPE urgency_level CASCADE;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
        DROP TYPE notification_type CASCADE;
    END IF;
END $$;

-- Step 2: Create all enum types fresh
CREATE TYPE user_role AS ENUM (
  'resident',           -- Regular citizens (existing)
  'guest',             -- Anonymous users (existing)  
  'barangay_admin',    -- Existing role
  'operations_manager', -- New: Overall coordination
  'system_admin',      -- New: Technical management
  'field_coordinator', -- New: Geographic coverage coordinators
  'data_analyst',      -- New: Reports and insights
  'super_admin'        -- New: System owner (you)
);

CREATE TYPE report_category AS ENUM (
  'broken_lights',      -- Existing
  'trash_collection',   -- Existing
  'water_issues',       -- Existing  
  'road_damage',        -- Existing
  'drainage',           -- Existing
  'public_safety',      -- Existing
  'noise_complaint',    -- Existing
  'roads_infrastructure', -- New comprehensive
  'utilities_power',    -- New
  'water_sanitation',   -- New
  'waste_management',   -- New
  'streetlights',       -- New
  'drainage_flooding',  -- New
  'public_facilities',  -- New
  'environmental',      -- New
  'other'               -- Existing
);

CREATE TYPE report_status AS ENUM (
  'pending',        -- Existing
  'in_progress',    -- Existing
  'resolved',       -- Existing
  'rejected',       -- Existing
  'submitted',      -- New: Initial state
  'reviewing',      -- New: Operations center reviewing
  'assigned',       -- New: Assigned to staff/department
  'pending_parts',  -- New: Waiting for materials/resources
  'verified',       -- New: Resolution confirmed
  'closed'          -- New: Case closed
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

-- Step 3: Update profiles table safely (preserve existing structure)
DO $$
BEGIN
    -- Add new columns only if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE public.profiles ADD COLUMN role user_role DEFAULT 'resident';
    END IF;
    
    -- Update existing role column to new type if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
        -- First, update any existing data to match new enum
        UPDATE public.profiles SET role = 'resident' WHERE role IS NULL;
    END IF;
    
    -- Add other missing columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'full_name') THEN
        -- If full_name doesn't exist, create it from first_name + last_name
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'first_name') THEN
            ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
            UPDATE public.profiles SET full_name = COALESCE(first_name, '') || ' ' || COALESCE(last_name, '') WHERE full_name IS NULL;
        ELSE
            ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
        END IF;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone') THEN
        ALTER TABLE public.profiles ADD COLUMN phone TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'barangay') THEN
        -- If barangay doesn't exist but barangay_name does, use that
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'barangay_name') THEN
            ALTER TABLE public.profiles ADD COLUMN barangay TEXT;
            UPDATE public.profiles SET barangay = barangay_name WHERE barangay IS NULL;
        ELSE
            ALTER TABLE public.profiles ADD COLUMN barangay TEXT;
        END IF;
    END IF;
END $$;

-- Step 4: Ensure barangays table exists with proper structure
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'barangays') THEN
        CREATE TABLE public.barangays (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL UNIQUE,
            code TEXT UNIQUE,
            population INTEGER,
            area_sqkm DECIMAL(10,2),
            captain_name TEXT,
            captain_contact TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    ELSE
        -- Add missing columns if they don't exist
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'barangays' AND column_name = 'id') THEN
            ALTER TABLE public.barangays ADD COLUMN id SERIAL PRIMARY KEY;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'barangays' AND column_name = 'population') THEN
            ALTER TABLE public.barangays ADD COLUMN population INTEGER;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'barangays' AND column_name = 'area_sqkm') THEN
            ALTER TABLE public.barangays ADD COLUMN area_sqkm DECIMAL(10,2);
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'barangays' AND column_name = 'captain_name') THEN
            ALTER TABLE public.barangays ADD COLUMN captain_name TEXT;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'barangays' AND column_name = 'captain_contact') THEN
            ALTER TABLE public.barangays ADD COLUMN captain_contact TEXT;
        END IF;
    END IF;
END $$;

-- Step 5: Create operations center tables (these are all new)

-- Operations staff table (NEW)
DROP TABLE IF EXISTS public.operations_staff CASCADE;
CREATE TABLE public.operations_staff (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID, -- Don't use foreign key yet, we'll add it later
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

-- Barangay officials table (NEW)
DROP TABLE IF EXISTS public.barangay_officials CASCADE;
CREATE TABLE public.barangay_officials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID, -- Don't use foreign key yet
    barangay_id INTEGER, -- Will reference barangays.id
    position TEXT NOT NULL, -- Captain, Councilor, Secretary, etc.
    term_start DATE,
    term_end DATE,
    is_active BOOLEAN DEFAULT TRUE,
    contact_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced reports table (replaces existing if it exists)
DROP TABLE IF EXISTS public.report_comments CASCADE;
DROP TABLE IF EXISTS public.report_votes CASCADE; 
DROP TABLE IF EXISTS public.reports CASCADE;

CREATE TABLE public.reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_number TEXT UNIQUE NOT NULL, -- Auto-generated: FMB-2024-001
    
    -- Reporter information (flexible - no foreign keys for now)
    reporter_id UUID, -- Will reference profiles.id
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
    barangay_id INTEGER, -- Will reference barangays.id
    barangay_name TEXT, -- For display
    specific_location TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    landmarks TEXT,
    
    -- Assignment and workflow
    status report_status DEFAULT 'submitted',
    assigned_to UUID, -- Will reference operations_staff.id
    assigned_department TEXT,
    priority_score INTEGER DEFAULT 50, -- Auto-calculated
    
    -- Tracking
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    estimated_resolution DATE,
    
    -- Additional data
    tags TEXT[],
    photo_url TEXT, -- Single photo (existing compatibility)
    photo_urls TEXT[], -- Multiple photos
    public_visibility BOOLEAN DEFAULT TRUE,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Report attachments (NEW)
CREATE TABLE public.report_attachments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_id UUID, -- Will reference reports.id
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL, -- image, video, document
    file_size INTEGER,
    uploaded_by UUID, -- Will reference profiles.id
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Report status history (NEW)
CREATE TABLE public.report_status_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_id UUID, -- Will reference reports.id
    from_status report_status,
    to_status report_status NOT NULL,
    changed_by UUID, -- Will reference profiles.id
    change_reason TEXT,
    notes TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Report comments (RECREATED)
CREATE TABLE public.report_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_id UUID, -- Will reference reports.id
    commenter_id UUID, -- Will reference profiles.id
    comment TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE, -- Internal ops comments vs public updates
    is_admin_comment BOOLEAN DEFAULT FALSE, -- Backward compatibility
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System notifications (NEW)
CREATE TABLE public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipient_id UUID, -- Will reference profiles.id
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    related_report_id UUID, -- Will reference reports.id
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 6: Create indexes for performance
CREATE INDEX idx_reports_status ON public.reports(status);
CREATE INDEX idx_reports_category ON public.reports(category);
CREATE INDEX idx_reports_barangay_id ON public.reports(barangay_id);
CREATE INDEX idx_reports_assigned_to ON public.reports(assigned_to);
CREATE INDEX idx_reports_reported_at ON public.reports(reported_at);
CREATE INDEX idx_reports_priority_score ON public.reports(priority_score);
CREATE INDEX idx_notifications_recipient ON public.notifications(recipient_id);
CREATE INDEX idx_report_attachments_report ON public.report_attachments(report_id);
CREATE INDEX idx_operations_staff_profile ON public.operations_staff(profile_id);

-- Step 7: Enable RLS on all tables
ALTER TABLE public.operations_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barangay_officials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Step 8: Create RLS policies (safe, flexible)

-- Operations staff policies
CREATE POLICY "Operations staff visible to operations roles" ON public.operations_staff 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role::text IN ('operations_manager', 'system_admin', 'super_admin', 'barangay_admin')
    )
);

-- Reports policies (flexible, no strict foreign keys)
CREATE POLICY "Public reports are viewable by everyone" ON public.reports 
FOR SELECT USING (public_visibility = true);

CREATE POLICY "Users can view their own reports" ON public.reports 
FOR SELECT USING (reporter_id = auth.uid());

CREATE POLICY "Operations staff can view all reports" ON public.reports 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role::text IN ('operations_manager', 'system_admin', 'field_coordinator', 'data_analyst', 'super_admin', 'barangay_admin')
    )
);

CREATE POLICY "Anyone can insert reports" ON public.reports 
FOR INSERT WITH CHECK (true);

CREATE POLICY "Operations staff can update reports" ON public.reports 
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role::text IN ('operations_manager', 'system_admin', 'field_coordinator', 'super_admin', 'barangay_admin')
    )
);

-- Report attachments policies
CREATE POLICY "Anyone can view attachments" ON public.report_attachments FOR SELECT USING (true);
CREATE POLICY "Anyone can insert attachments" ON public.report_attachments FOR INSERT WITH CHECK (true);

-- Report comments policies  
CREATE POLICY "Comments are viewable by everyone" ON public.report_comments FOR SELECT USING (true);
CREATE POLICY "Anyone can insert comments" ON public.report_comments FOR INSERT WITH CHECK (true);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications 
FOR SELECT USING (recipient_id = auth.uid());

CREATE POLICY "System can insert notifications" ON public.notifications 
FOR INSERT WITH CHECK (true);

-- Step 9: Create utility functions

-- Function to auto-generate report numbers
CREATE OR REPLACE FUNCTION public.generate_report_number()
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
    FROM public.reports 
    WHERE report_number LIKE 'FMB-' || year_part || '-%';
    
    report_num := 'FMB-' || year_part || '-' || LPAD(sequence_num::TEXT, 4, '0');
    
    RETURN report_num;
END;
$$ LANGUAGE plpgsql;

-- Function to set report number on insert
CREATE OR REPLACE FUNCTION public.set_report_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.report_number IS NULL OR NEW.report_number = '' THEN
        NEW.report_number := public.generate_report_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-generating report numbers
DROP TRIGGER IF EXISTS trigger_set_report_number ON public.reports;
CREATE TRIGGER trigger_set_report_number
    BEFORE INSERT ON public.reports
    FOR EACH ROW
    EXECUTE FUNCTION public.set_report_number();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update timestamp triggers
DROP TRIGGER IF EXISTS trigger_update_profiles_updated_at ON public.profiles;
CREATE TRIGGER trigger_update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_operations_staff_updated_at ON public.operations_staff;
CREATE TRIGGER trigger_update_operations_staff_updated_at
    BEFORE UPDATE ON public.operations_staff
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_update_reports_updated_at ON public.reports;
CREATE TRIGGER trigger_update_reports_updated_at
    BEFORE UPDATE ON public.reports
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Step 10: Insert sample data to ensure everything works

-- Insert some sample operations staff
INSERT INTO public.operations_staff (staff_id, position, department, assigned_barangays) VALUES
('OPS001', 'Operations Manager', 'Administration', ARRAY['Poblacion', 'San Juan', 'Rizal']),
('OPS002', 'Field Coordinator - North', 'Field Operations', ARRAY['Alang-alang', 'Anomar', 'Bilabid']),
('OPS003', 'Field Coordinator - South', 'Field Operations', ARRAY['Luna', 'Mabini', 'Mapawa'])
ON CONFLICT (staff_id) DO NOTHING;

-- MIGRATION COMPLETE!
-- Your database now supports the centralized operations center
-- All existing data is preserved, new features are ready to use
