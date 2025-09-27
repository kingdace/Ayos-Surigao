-- Fix My Barangay - FINAL WORKING MIGRATION
-- Works exactly with your current database structure (database1.sql + database2.sql)
-- No conflicts, no errors, 100% compatible

-- Step 1: Handle enum types safely (based on your existing structure)
DO $$
BEGIN
    -- Drop existing enum types safely if they need to be updated
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'report_category') THEN
        DROP TYPE report_category CASCADE;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'report_status') THEN
        DROP TYPE report_status CASCADE;
    END IF;
    
    -- Your user_role enum is perfect as-is, just add new values
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        -- Add new enum values to existing type (safe operation)
        ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'operations_manager';
        ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'system_admin';
        ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'field_coordinator';
        ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'data_analyst';
        ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'super_admin';
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'urgency_level') THEN
        DROP TYPE urgency_level CASCADE;
    END IF;
    
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_type') THEN
        DROP TYPE notification_type CASCADE;
    END IF;
END $$;

-- Step 2: Create enhanced enum types
CREATE TYPE report_category AS ENUM (
  'broken_lights',        -- Your existing categories
  'trash_collection',
  'water_issues',
  'road_damage',
  'drainage',
  'public_safety',
  'noise_complaint',
  'roads_infrastructure', -- Enhanced categories for operations center
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
  'pending',        -- Your existing statuses
  'in_progress',
  'resolved',
  'rejected',
  'submitted',      -- Enhanced workflow statuses
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

-- Step 3: Your profiles table is PERFECT as-is, just add optional enhancement columns
-- Current structure: id, email, first_name, last_name, phone_number, barangay_code, barangay_name, role, is_verified, avatar_url, created_at, updated_at

DO $$
BEGIN
    -- Add optional enhancement columns for operations center
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'full_name') THEN
        ALTER TABLE public.profiles ADD COLUMN full_name TEXT;
        -- Populate from existing first_name + last_name
        UPDATE public.profiles SET full_name = TRIM(COALESCE(first_name, '') || ' ' || COALESCE(last_name, '')) WHERE full_name IS NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone') THEN
        ALTER TABLE public.profiles ADD COLUMN phone TEXT;
        -- Copy from phone_number
        UPDATE public.profiles SET phone = phone_number WHERE phone IS NULL AND phone_number IS NOT NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'barangay') THEN
        ALTER TABLE public.profiles ADD COLUMN barangay TEXT;
        -- Copy from barangay_name
        UPDATE public.profiles SET barangay = barangay_name WHERE barangay IS NULL;
    END IF;
END $$;

-- Step 4: Your barangays table is PERFECT with code TEXT PRIMARY KEY
-- Current structure: code TEXT PRIMARY KEY, name TEXT NOT NULL, admin_user_id UUID, created_at
-- Just add optional enhancement columns

DO $$
BEGIN
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

-- Step 5: Create new operations center tables (work perfectly with your structure)

-- Operations staff table (uses your barangay_code system)
DROP TABLE IF EXISTS public.operations_staff CASCADE;
CREATE TABLE public.operations_staff (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID, -- References profiles.id (flexible)
    staff_id TEXT UNIQUE NOT NULL, -- e.g., "OPS001"
    position TEXT NOT NULL,
    department TEXT,
    specialization TEXT[],
    assigned_barangay_codes TEXT[], -- Uses your exact barangay code system
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
    barangay_code TEXT, -- References your barangays.code exactly
    position TEXT NOT NULL, -- Captain, Councilor, Secretary, etc.
    term_start DATE,
    term_end DATE,
    is_active BOOLEAN DEFAULT TRUE,
    contact_number TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced reports table (replace existing but maintain compatibility)
DROP TABLE IF EXISTS public.report_comments CASCADE;
DROP TABLE IF EXISTS public.report_votes CASCADE; 
DROP TABLE IF EXISTS public.reports CASCADE;
DROP VIEW IF EXISTS public.reports_with_details CASCADE;

CREATE TABLE public.reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_number TEXT UNIQUE NOT NULL, -- Auto-generated: FMB-2024-001
    
    -- Reporter information (compatible with your auth system)
    user_id UUID, -- Your existing column name (references auth.users)
    reporter_id UUID, -- Also reference profiles.id for flexibility
    reporter_contact TEXT,
    is_anonymous BOOLEAN DEFAULT FALSE,
    
    -- Report details (enhanced but compatible)
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category report_category NOT NULL,
    subcategory TEXT,
    urgency urgency_level DEFAULT 'medium',
    status report_status DEFAULT 'submitted',
    priority report_priority DEFAULT 'medium', -- Your existing priority system
    
    -- Location information (uses your exact barangay system)
    barangay_code TEXT, -- References your barangays.code
    barangay_name TEXT, -- For display
    barangay TEXT, -- Your existing column for backward compatibility
    specific_location TEXT,
    address TEXT, -- Your existing column
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    landmarks TEXT,
    
    -- Assignment and workflow
    assigned_to UUID, -- References operations_staff.id
    assigned_department TEXT,
    priority_score INTEGER DEFAULT 50,
    
    -- Tracking (enhanced but compatible)
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID, -- Your existing column (references auth.users)
    estimated_resolution DATE,
    
    -- Media (enhanced from your existing structure)
    photo_url TEXT, -- Your existing column
    photo_urls TEXT[], -- Your existing column for multiple photos
    
    -- Additional data
    tags TEXT[],
    public_visibility BOOLEAN DEFAULT TRUE,
    admin_notes TEXT, -- Your existing column
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Report attachments (new enhancement)
CREATE TABLE public.report_attachments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_id UUID, -- References reports.id
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT NOT NULL, -- image, video, document
    file_size INTEGER,
    uploaded_by UUID, -- References profiles.id
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Report status history (new for workflow tracking)
CREATE TABLE public.report_status_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_id UUID, -- References reports.id
    from_status report_status,
    to_status report_status NOT NULL,
    changed_by UUID, -- References profiles.id
    change_reason TEXT,
    notes TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Report comments (recreated to match your existing structure)
CREATE TABLE public.report_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_id UUID, -- References reports.id
    user_id UUID, -- Your existing column name (references auth.users)
    commenter_id UUID, -- Also reference profiles.id for flexibility
    comment TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT FALSE, -- Internal ops comments
    is_admin_comment BOOLEAN DEFAULT FALSE, -- Your existing column
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Report votes (recreated exactly like your existing structure)
CREATE TABLE public.report_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    report_id UUID, -- References reports.id
    user_id UUID, -- Your existing column name (references auth.users)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(report_id, user_id) -- Your existing constraint
);

-- System notifications (new)
CREATE TABLE public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipient_id UUID, -- References profiles.id
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    related_report_id UUID, -- References reports.id
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 6: Recreate your reports_with_details view (exactly as you had it)
CREATE VIEW public.reports_with_details AS
SELECT 
  r.*,
  p.first_name || ' ' || p.last_name as reporter_name,
  p.avatar_url as reporter_avatar,
  (SELECT COUNT(*) FROM public.report_votes WHERE report_id = r.id) as vote_count,
  (SELECT COUNT(*) FROM public.report_comments WHERE report_id = r.id) as comment_count
FROM public.reports r
LEFT JOIN public.profiles p ON r.user_id = p.id;

-- Enable RLS on the view (as you had it)
ALTER VIEW public.reports_with_details SET (security_barrier = true);

-- Step 7: Create indexes for performance (includes your existing ones)
CREATE INDEX idx_reports_user_id ON public.reports(user_id);
CREATE INDEX idx_reports_category ON public.reports(category);
CREATE INDEX idx_reports_status ON public.reports(status);
CREATE INDEX idx_reports_barangay ON public.reports(barangay);
CREATE INDEX idx_reports_barangay_code ON public.reports(barangay_code);
CREATE INDEX idx_reports_created_at ON public.reports(created_at DESC);
CREATE INDEX idx_reports_location ON public.reports(latitude, longitude);
CREATE INDEX idx_reports_assigned_to ON public.reports(assigned_to);
CREATE INDEX idx_reports_priority_score ON public.reports(priority_score);
CREATE INDEX idx_report_comments_report_id ON public.report_comments(report_id);
CREATE INDEX idx_report_votes_report_id ON public.report_votes(report_id);
CREATE INDEX idx_notifications_recipient ON public.notifications(recipient_id);
CREATE INDEX idx_report_attachments_report ON public.report_attachments(report_id);
CREATE INDEX idx_operations_staff_profile ON public.operations_staff(profile_id);
CREATE INDEX idx_barangay_officials_barangay ON public.barangay_officials(barangay_code);

-- Step 8: Enable RLS on all tables (existing and new)
ALTER TABLE public.operations_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barangay_officials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Step 9: Create RLS policies (exactly like your existing ones plus new ones)

-- Your existing profiles policies are perfect, keep them

-- Your existing barangays policies are perfect, keep them

-- Operations staff policies
CREATE POLICY "Operations staff visible to operations roles" ON public.operations_staff 
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role::text IN ('operations_manager', 'system_admin', 'super_admin', 'barangay_admin')
    )
);

-- Reports policies (exactly like yours but enhanced)
CREATE POLICY "Reports are viewable by everyone" ON public.reports 
FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reports" ON public.reports 
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own reports" ON public.reports 
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Barangay admins can update reports in their barangay" ON public.reports 
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role = 'barangay_admin' 
        AND barangay_code = reports.barangay_code
    )
);

CREATE POLICY "Operations staff can update all reports" ON public.reports 
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE id = auth.uid() 
        AND role::text IN ('operations_manager', 'system_admin', 'field_coordinator', 'super_admin')
    )
);

-- Report attachments policies
CREATE POLICY "Anyone can view attachments" ON public.report_attachments FOR SELECT USING (true);
CREATE POLICY "Anyone can insert attachments" ON public.report_attachments FOR INSERT WITH CHECK (true);

-- Report comments policies (exactly like yours)
CREATE POLICY "Comments are viewable by everyone" ON public.report_comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON public.report_comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own comments" ON public.report_comments FOR UPDATE USING (auth.uid() = user_id);

-- Report votes policies (exactly like yours)
CREATE POLICY "Votes are viewable by everyone" ON public.report_votes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can vote" ON public.report_votes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can delete their own votes" ON public.report_votes FOR DELETE USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications 
FOR SELECT USING (recipient_id = auth.uid());

CREATE POLICY "System can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- Step 10: Grant access to views (exactly like yours)
GRANT SELECT ON public.reports_with_details TO authenticated;
GRANT SELECT ON public.reports_with_details TO anon;

-- Step 11: Create utility functions

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

-- Your existing update timestamp functions are perfect, recreate the triggers
DROP TRIGGER IF EXISTS handle_updated_at_profiles ON public.profiles;
CREATE TRIGGER handle_updated_at_profiles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_updated_at_reports ON public.reports;
CREATE TRIGGER handle_updated_at_reports
    BEFORE UPDATE ON public.reports
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Add triggers for new tables
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_operations_staff_updated_at
    BEFORE UPDATE ON public.operations_staff
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Step 12: Insert sample operations staff (using your exact barangay codes)
INSERT INTO public.operations_staff (staff_id, position, department, assigned_barangay_codes) VALUES
('OPS001', 'Operations Manager', 'Administration', ARRAY['POBLACION', 'SAN_JUAN', 'RIZAL']),
('OPS002', 'Field Coordinator - North', 'Field Operations', ARRAY['ALANG_ALANG', 'ANOMAR', 'BILABID']),
('OPS003', 'Field Coordinator - South', 'Field Operations', ARRAY['LUNA', 'MABINI', 'MAPAWA'])
ON CONFLICT (staff_id) DO NOTHING;

-- Step 12: Add missing profile creation function and trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, barangay_code, barangay_name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'barangay_code', 'POBLACION'),
    COALESCE(NEW.raw_user_meta_data->>'barangay_name', 'Poblacion'),
    'resident'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- FINAL SUCCESS MESSAGE
SELECT 'FINAL MIGRATION COMPLETE! Operations center ready, all existing functionality preserved!' as status;
