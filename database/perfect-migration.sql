-- Fix My Barangay - Perfect Migration Script
-- Tailored exactly to your current simple-schema.sql structure
-- No conflicts, no errors, preserves everything

-- Step 1: Handle enum types safely
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

-- Step 2: Create enhanced enum types
CREATE TYPE user_role AS ENUM (
  'resident',           -- Existing
  'barangay_admin',     -- Existing  
  'guest',              -- Existing
  'operations_manager', -- New: Overall coordination
  'system_admin',       -- New: Technical management
  'field_coordinator',  -- New: Geographic coverage coordinators
  'data_analyst',       -- New: Reports and insights
  'super_admin'         -- New: System owner (you)
);

CREATE TYPE report_category AS ENUM (
  'broken_lights',        -- Classic categories
  'trash_collection',
  'water_issues',
  'road_damage',
  'drainage',
  'public_safety',
  'noise_complaint',
  'roads_infrastructure', -- Enhanced categories
  'utilities_power',
  'water_sanitation',
  'waste_management',
  'streetlights',
  'drainage_flooding',
  'public_facilities',
  'environmental',
  'other'
);

CREATE TYPE report_status AS ENUM (
  'pending',        -- Classic statuses
  'in_progress',
  'resolved',
  'rejected',
  'submitted',      -- Enhanced workflow
  'reviewing',
  'assigned',
  'pending_parts',
  'verified',
  'closed'
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

-- Step 3: Update existing profiles table (your current structure)
-- Your profiles table has: id, email, first_name, last_name, phone_number, barangay_code, barangay_name, role, is_verified, avatar_url, created_at, updated_at

DO $$
BEGIN
    -- Update the role column to use the new enum (it already exists)
    -- First set any NULL roles to 'resident'
    UPDATE public.profiles SET role = 'resident' WHERE role IS NULL;
    
    -- Add any missing columns that might be needed for operations center
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'full_name') THEN
        ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
        -- Populate full_name from existing first_name + last_name
        UPDATE public.profiles SET full_name = TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')) WHERE full_name IS NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone') THEN
        ALTER TABLE public.profiles ADD COLUMN phone TEXT;
        -- Copy from phone_number if it exists
        UPDATE public.profiles SET phone = phone_number WHERE phone IS NULL AND phone_number IS NOT NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'barangay') THEN
        ALTER TABLE public.profiles ADD COLUMN barangay TEXT;
        -- Copy from barangay_name
        UPDATE public.profiles SET barangay = barangay_name WHERE barangay IS NULL;
    END IF;
END $$;

-- Step 4: Your barangays table is perfect as-is, just add optional enhancement columns
-- Your current structure: code TEXT PRIMARY KEY, name TEXT NOT NULL, admin_user_id UUID, created_at

DO $$
BEGIN
    -- Add optional enhancement columns for operations center
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
END $$;

-- Step 5: Create new operations center tables (work with your existing barangays structure)

-- Operations staff table
DROP TABLE IF EXISTS public.operations_staff CASCADE;
CREATE TABLE public.operations_staff (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID, -- References profiles.id (flexible)
    staff_id TEXT UNIQUE NOT NULL, -- e.g., "OPS001"
    position TEXT NOT NULL,
    department TEXT,
    specialization TEXT[],
    assigned_barangay_codes TEXT[], -- Uses your barangay codes (TEXT)
    is_active BOOLEAN DEFAULT TRUE,
    hire_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Barangay officials table (works with your code-based barangays)
DROP TABLE IF EXISTS public.barangay_officials CASCADE;
CREATE TABLE public.barangay_officials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID, -- References profiles.id (flexible)
    barangay_code TEXT, -- References barangays.code (your structure)
    position TEXT NOT NULL, -- Captain, Councilor, Secretary, etc.
    term_start DATE,
    term_end DATE,
    is_active BOOLEAN DEFAULT TRUE,
    contact_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced reports table (drop any existing first)
DROP TABLE IF EXISTS public.report_comments CASCADE;
DROP TABLE IF EXISTS public.report_votes CASCADE; 
DROP TABLE IF EXISTS public.reports CASCADE;

CREATE TABLE public.reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_number TEXT UNIQUE NOT NULL, -- Auto-generated: FMB-2024-001
    
    -- Reporter information (flexible references)
    reporter_id UUID, -- References profiles.id (flexible)
    reporter_name TEXT, -- For anonymous reports
    reporter_contact TEXT,
    is_anonymous BOOLEAN DEFAULT FALSE,
    
    -- Report details
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category report_category NOT NULL,
    subcategory TEXT,
    urgency urgency_level DEFAULT 'medium',
    
    -- Location information (uses your barangay code system)
    barangay_code TEXT, -- References barangays.code (your structure)
    barangay_name TEXT, -- For display
    specific_location TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    landmarks TEXT,
    address TEXT, -- Backward compatibility
    
    -- Assignment and workflow
    status report_status DEFAULT 'submitted',
    assigned_to UUID, -- References operations_staff.id (flexible)
    assigned_department TEXT,
    priority_score INTEGER DEFAULT 50,
    
    -- Tracking
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID, -- References profiles.id (flexible)
    estimated_resolution DATE,
    
    -- Media (enhanced from your existing structure)
    photo_url TEXT, -- Single photo (backward compatibility)
    photo_urls TEXT[], -- Multiple photos (new)
    
    -- Additional data
    tags TEXT[],
    public_visibility BOOLEAN DEFAULT TRUE,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Report attachments (new)
DROP TABLE IF EXISTS public.report_attachments CASCADE;
CREATE TABLE public.report_attachments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_id UUID, -- References reports.id (flexible)
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL, -- image, video, document
    file_size INTEGER,
    uploaded_by UUID, -- References profiles.id (flexible)
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Report status history (new)
DROP TABLE IF EXISTS public.report_status_history CASCADE;
CREATE TABLE public.report_status_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_id UUID, -- References reports.id (flexible)
    from_status report_status,
    to_status report_status NOT NULL,
    changed_by UUID, -- References profiles.id (flexible)
    change_reason TEXT,
    notes TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Report comments (recreated with enhanced features)
CREATE TABLE public.report_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_id UUID, -- References reports.id (flexible)
    commenter_id UUID, -- References profiles.id (flexible)
    comment TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE, -- Internal ops comments
    is_admin_comment BOOLEAN DEFAULT FALSE, -- Backward compatibility
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Report votes (recreated for backward compatibility)
DROP TABLE IF EXISTS public.report_votes CASCADE;
CREATE TABLE public.report_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_id UUID, -- References reports.id (flexible)
    user_id UUID, -- References profiles.id (flexible)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System notifications (new)
DROP TABLE IF EXISTS public.notifications CASCADE;
CREATE TABLE public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipient_id UUID, -- References profiles.id (flexible)
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    related_report_id UUID, -- References reports.id (flexible)
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 6: Create indexes for performance
CREATE INDEX idx_reports_status ON public.reports(status);
CREATE INDEX idx_reports_category ON public.reports(category);
CREATE INDEX idx_reports_barangay_code ON public.reports(barangay_code);
CREATE INDEX idx_reports_assigned_to ON public.reports(assigned_to);
CREATE INDEX idx_reports_reported_at ON public.reports(reported_at);
CREATE INDEX idx_reports_priority_score ON public.reports(priority_score);
CREATE INDEX idx_notifications_recipient ON public.notifications(recipient_id);
CREATE INDEX idx_report_attachments_report ON public.report_attachments(report_id);
CREATE INDEX idx_operations_staff_profile ON public.operations_staff(profile_id);
CREATE INDEX idx_barangay_officials_barangay ON public.barangay_officials(barangay_code);

-- Step 7: Enable RLS on all new tables (existing tables already have RLS)
ALTER TABLE public.operations_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barangay_officials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Step 8: Create RLS policies

-- Operations staff policies
CREATE POLICY "Operations staff visible to operations roles" ON public.operations_staff 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role::text IN ('operations_manager', 'system_admin', 'super_admin', 'barangay_admin')
    )
);

-- Reports policies
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

CREATE POLICY "Anyone can insert reports" ON public.reports FOR INSERT WITH CHECK (true);

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

-- Report votes policies (backward compatibility)
CREATE POLICY "Votes are viewable by everyone" ON public.report_votes FOR SELECT USING (true);
CREATE POLICY "Anyone can vote" ON public.report_votes FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can delete their own votes" ON public.report_votes FOR DELETE USING (user_id = auth.uid());

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications 
FOR SELECT USING (recipient_id = auth.uid());

CREATE POLICY "System can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);

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

-- Step 10: Insert sample operations staff (using your barangay codes)
INSERT INTO public.operations_staff (staff_id, position, department, assigned_barangay_codes) VALUES
('OPS001', 'Operations Manager', 'Administration', ARRAY['POBLACION', 'SAN_JUAN', 'RIZAL']),
('OPS002', 'Field Coordinator - North', 'Field Operations', ARRAY['ALANG_ALANG', 'ANOMAR', 'BILABID']),
('OPS003', 'Field Coordinator - South', 'Field Operations', ARRAY['LUNA', 'MABINI', 'MAPAWA'])
ON CONFLICT (staff_id) DO NOTHING;

-- PERFECT MIGRATION COMPLETE!
-- Tailored exactly to your existing simple-schema.sql structure
-- No conflicts, all existing data preserved, operations center ready
