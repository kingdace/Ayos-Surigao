-- Fix My Barangay - Centralized Operations Center Database Schema
-- Comprehensive schema for centralized admin approach

-- Enhanced user roles for centralized system
DROP TYPE IF EXISTS user_role CASCADE;
CREATE TYPE user_role AS ENUM (
  'resident',           -- Regular citizens
  'guest',             -- Anonymous users
  'operations_manager', -- Overall coordination
  'system_admin',      -- Technical management
  'field_coordinator', -- Geographic coverage coordinators
  'data_analyst',      -- Reports and insights
  'super_admin'        -- System owner (you)
);

-- Report categories
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

-- Report status workflow
CREATE TYPE report_status AS ENUM (
  'submitted',         -- Initial submission
  'triaged',          -- Categorized by operations center
  'assigned',         -- Assigned to field coordinator
  'in_progress',      -- Being worked on
  'forwarded',        -- Sent to barangay official
  'resolved',         -- Issue fixed
  'closed',           -- Closed (resolved or rejected)
  'reopened'          -- Reopened for follow-up
);

-- Urgency levels
CREATE TYPE urgency_level AS ENUM (
  'low',
  'medium', 
  'high',
  'emergency'
);

-- Enhanced profiles table
DROP TABLE IF EXISTS public.profiles CASCADE;
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone_number TEXT,
  barangay_code TEXT NOT NULL,
  barangay_name TEXT NOT NULL,
  role user_role DEFAULT 'resident',
  is_verified BOOLEAN DEFAULT FALSE,
  avatar_url TEXT,
  -- Admin-specific fields
  coordinator_zone TEXT, -- For field coordinators: 'north', 'central', 'south'
  specialization TEXT[], -- Array of categories they handle
  -- Resident-specific fields
  address TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Operations center staff table
CREATE TABLE public.operations_staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  staff_id TEXT UNIQUE NOT NULL, -- e.g., 'OM001', 'FC001'
  department TEXT NOT NULL, -- 'operations', 'technical', 'field', 'analytics'
  supervisor_id UUID REFERENCES public.operations_staff(id),
  shift_schedule TEXT, -- 'morning', 'afternoon', 'night', 'flexible'
  contact_number TEXT,
  emergency_contact TEXT,
  is_on_duty BOOLEAN DEFAULT FALSE,
  hire_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comprehensive reports table
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_number TEXT UNIQUE NOT NULL, -- Auto-generated: FMB-2024-001234
  
  -- Report Content
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category report_category NOT NULL,
  subcategory TEXT, -- More specific classification
  urgency urgency_level DEFAULT 'medium',
  
  -- Location Information
  barangay_code TEXT NOT NULL,
  barangay_name TEXT NOT NULL,
  specific_location TEXT, -- Street address or landmark
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  location_accuracy DECIMAL, -- GPS accuracy in meters
  
  -- Reporter Information
  reporter_id UUID REFERENCES auth.users(id),
  reporter_name TEXT, -- For guest reports
  reporter_contact TEXT, -- For guest reports
  is_anonymous BOOLEAN DEFAULT FALSE,
  
  -- Status & Workflow
  status report_status DEFAULT 'submitted',
  priority_score INTEGER DEFAULT 50, -- 0-100 calculated score
  estimated_cost DECIMAL(12,2), -- Estimated resolution cost
  
  -- Assignment & Tracking
  assigned_to UUID REFERENCES public.operations_staff(id),
  assigned_at TIMESTAMP WITH TIME ZONE,
  triaged_by UUID REFERENCES public.operations_staff(id),
  triaged_at TIMESTAMP WITH TIME ZONE,
  
  -- Barangay Communication
  barangay_contact_name TEXT,
  barangay_contact_number TEXT,
  barangay_notification_sent BOOLEAN DEFAULT FALSE,
  barangay_notification_date TIMESTAMP WITH TIME ZONE,
  
  -- Resolution Information
  resolution_notes TEXT,
  resolution_cost DECIMAL(12,2),
  resolved_by TEXT, -- Name of person/agency who resolved
  resolved_at TIMESTAMP WITH TIME ZONE,
  
  -- Engagement Metrics
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Report images/attachments
CREATE TABLE public.report_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL, -- 'image', 'document', 'video'
  file_size INTEGER, -- in bytes
  caption TEXT,
  is_before_photo BOOLEAN DEFAULT TRUE, -- true for before, false for after
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Report status history for tracking workflow
CREATE TABLE public.report_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
  old_status report_status,
  new_status report_status NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Community engagement - likes/votes
CREATE TABLE public.report_engagements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  engagement_type TEXT CHECK (engagement_type IN ('like', 'important', 'watching')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(report_id, user_id, engagement_type)
);

-- Comments/updates on reports
CREATE TABLE public.report_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  comment TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT FALSE, -- Internal operations notes vs public comments
  is_official_update BOOLEAN DEFAULT FALSE, -- Official status updates
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Barangay officials directory
CREATE TABLE public.barangay_officials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barangay_code TEXT NOT NULL,
  name TEXT NOT NULL,
  position TEXT NOT NULL, -- 'captain', 'secretary', 'kagawad', 'sk_chairman'
  contact_number TEXT,
  email TEXT,
  is_primary_contact BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System notifications/alerts
CREATE TABLE public.system_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL, -- 'report_assigned', 'status_update', 'system_alert'
  related_report_id UUID REFERENCES public.reports(id),
  is_read BOOLEAN DEFAULT FALSE,
  priority urgency_level DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance metrics and analytics
CREATE TABLE public.analytics_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  barangay_code TEXT,
  total_reports INTEGER DEFAULT 0,
  resolved_reports INTEGER DEFAULT 0,
  average_resolution_time INTERVAL,
  total_cost DECIMAL(12,2) DEFAULT 0,
  staff_member UUID REFERENCES public.operations_staff(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_reports_status ON public.reports(status);
CREATE INDEX idx_reports_barangay ON public.reports(barangay_code);
CREATE INDEX idx_reports_category ON public.reports(category);
CREATE INDEX idx_reports_urgency ON public.reports(urgency);
CREATE INDEX idx_reports_created_at ON public.reports(created_at);
CREATE INDEX idx_reports_assigned_to ON public.reports(assigned_to);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_barangay ON public.profiles(barangay_code);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operations_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_engagements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barangay_officials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- Profiles policies
CREATE POLICY "Profiles are viewable by authenticated users" ON public.profiles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Reports policies - residents can see all, admins can manage
CREATE POLICY "Reports are viewable by all authenticated users" ON public.reports
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can create reports" ON public.reports
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Admins can update reports" ON public.reports
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role IN ('operations_manager', 'system_admin', 'field_coordinator', 'super_admin')
    )
  );

-- Report attachments policies
CREATE POLICY "Report attachments are viewable by all authenticated users" ON public.report_attachments
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can upload attachments to their reports" ON public.report_attachments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.reports 
      WHERE id = report_id 
      AND (reporter_id = auth.uid() OR auth.uid() IN (
        SELECT id FROM public.profiles 
        WHERE role IN ('operations_manager', 'system_admin', 'field_coordinator', 'super_admin')
      ))
    )
  );

-- Functions for automation

-- Function to generate report number
CREATE OR REPLACE FUNCTION generate_report_number()
RETURNS TEXT AS $$
DECLARE
  year TEXT := EXTRACT(YEAR FROM NOW())::TEXT;
  sequence_num TEXT;
BEGIN
  -- Get next sequence number for the year
  SELECT LPAD((COALESCE(MAX(SUBSTRING(report_number FROM 'FMB-' || year || '-(.*)$')::INTEGER), 0) + 1)::TEXT, 6, '0')
  INTO sequence_num
  FROM public.reports
  WHERE report_number LIKE 'FMB-' || year || '-%';
  
  RETURN 'FMB-' || year || '-' || sequence_num;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-assign priority score
CREATE OR REPLACE FUNCTION calculate_priority_score(
  p_urgency urgency_level,
  p_category report_category,
  p_barangay_code TEXT
)
RETURNS INTEGER AS $$
DECLARE
  base_score INTEGER := 50;
  urgency_modifier INTEGER;
  category_modifier INTEGER;
BEGIN
  -- Urgency modifiers
  urgency_modifier := CASE p_urgency
    WHEN 'emergency' THEN 40
    WHEN 'high' THEN 25
    WHEN 'medium' THEN 0
    WHEN 'low' THEN -15
  END;
  
  -- Category modifiers (public safety gets priority)
  category_modifier := CASE p_category
    WHEN 'public_safety' THEN 20
    WHEN 'utilities_power' THEN 15
    WHEN 'water_sanitation' THEN 15
    WHEN 'roads_infrastructure' THEN 10
    WHEN 'streetlights' THEN 5
    ELSE 0
  END;
  
  RETURN GREATEST(0, LEAST(100, base_score + urgency_modifier + category_modifier));
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-populate report fields
CREATE OR REPLACE FUNCTION handle_new_report()
RETURNS TRIGGER AS $$
BEGIN
  -- Generate report number
  NEW.report_number := generate_report_number();
  
  -- Calculate priority score
  NEW.priority_score := calculate_priority_score(NEW.urgency, NEW.category, NEW.barangay_code);
  
  -- Set initial status
  NEW.status := 'submitted';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_report_created ON public.reports;
CREATE TRIGGER on_report_created
  BEFORE INSERT ON public.reports
  FOR EACH ROW EXECUTE FUNCTION handle_new_report();

-- Function to log status changes
CREATE OR REPLACE FUNCTION log_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.report_status_history (report_id, old_status, new_status, changed_by)
    VALUES (NEW.id, OLD.status, NEW.status, auth.uid());
  END IF;
  
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_report_status_change ON public.reports;
CREATE TRIGGER on_report_status_change
  BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION log_status_change();

-- Update the user creation trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, barangay_code, barangay_name)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'barangay_code', 'POBLACION'),
    COALESCE(NEW.raw_user_meta_data->>'barangay_name', 'Poblacion')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create useful views
CREATE OR REPLACE VIEW reports_with_details AS
SELECT 
  r.*,
  p.first_name || ' ' || p.last_name AS reporter_name,
  p.phone_number AS reporter_phone,
  ops.staff_id AS assigned_staff_id,
  ops_profile.first_name || ' ' || ops_profile.last_name AS assigned_staff_name,
  (SELECT COUNT(*) FROM report_attachments WHERE report_id = r.id) AS attachment_count,
  (SELECT COUNT(*) FROM report_engagements WHERE report_id = r.id AND engagement_type = 'like') AS likes_count
FROM reports r
LEFT JOIN profiles p ON r.reporter_id = p.id
LEFT JOIN operations_staff ops ON r.assigned_to = ops.id
LEFT JOIN profiles ops_profile ON ops.user_id = ops_profile.id;

-- Insert sample barangay officials data
INSERT INTO public.barangay_officials (barangay_code, name, position, contact_number, email, is_primary_contact) VALUES
('POBLACION', 'Maria Santos', 'captain', '09171234567', 'poblacion.captain@surigao.gov.ph', true),
('SAN_JUAN', 'Juan Dela Cruz', 'captain', '09181234567', 'sanjuan.captain@surigao.gov.ph', true),
('TAFT', 'Ana Rodriguez', 'captain', '09191234567', 'taft.captain@surigao.gov.ph', true),
('LUNA', 'Carlos Mendoza', 'captain', '09201234567', 'luna.captain@surigao.gov.ph', true),
('MABINI', 'Rosa Garcia', 'captain', '09211234567', 'mabini.captain@surigao.gov.ph', true)
ON CONFLICT (barangay_code, name, position) DO NOTHING;

-- Success message
SELECT 'Centralized Operations Center database schema created successfully!' AS status;
