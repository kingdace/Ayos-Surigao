-- Fix My Barangay Database Schema
-- This script creates all necessary tables and policies for the barangay reporting app

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for report categories
CREATE TYPE report_category AS ENUM (
  'broken_lights',
  'trash_collection',
  'water_issues',
  'road_damage',
  'drainage',
  'public_safety',
  'noise_complaint',
  'other'
);

-- Create enum for report status
CREATE TYPE report_status AS ENUM (
  'pending',
  'in_progress',
  'resolved',
  'rejected'
);

-- Create enum for report priority
CREATE TYPE report_priority AS ENUM (
  'low',
  'medium',
  'high',
  'urgent'
);

-- Create profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  phone_number TEXT,
  barangay TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reports table
CREATE TABLE public.reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category report_category NOT NULL,
  status report_status DEFAULT 'pending',
  priority report_priority DEFAULT 'medium',
  
  -- Location data
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  address TEXT,
  barangay TEXT,
  
  -- Media
  photo_url TEXT,
  photo_urls TEXT[], -- For multiple photos
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id),
  admin_notes TEXT
);

-- Create comments table for updates on reports
CREATE TABLE public.report_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  comment TEXT NOT NULL,
  is_admin_comment BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create likes/votes table
CREATE TABLE public.report_votes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(report_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX idx_reports_user_id ON public.reports(user_id);
CREATE INDEX idx_reports_category ON public.reports(category);
CREATE INDEX idx_reports_status ON public.reports(status);
CREATE INDEX idx_reports_barangay ON public.reports(barangay);
CREATE INDEX idx_reports_created_at ON public.reports(created_at DESC);
CREATE INDEX idx_reports_location ON public.reports(latitude, longitude);
CREATE INDEX idx_report_comments_report_id ON public.report_comments(report_id);
CREATE INDEX idx_report_votes_report_id ON public.report_votes(report_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_votes ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Reports policies
CREATE POLICY "Reports are viewable by everyone" ON public.reports
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create reports" ON public.reports
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own reports" ON public.reports
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can update any report" ON public.reports
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Comments policies
CREATE POLICY "Comments are viewable by everyone" ON public.report_comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON public.report_comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own comments" ON public.report_comments
  FOR UPDATE USING (auth.uid() = user_id);

-- Votes policies
CREATE POLICY "Votes are viewable by everyone" ON public.report_votes
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can vote" ON public.report_votes
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own votes" ON public.report_votes
  FOR DELETE USING (auth.uid() = user_id);

-- Create functions and triggers

-- Function to automatically create a profile when a user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER handle_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_reports
  BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create a view for reports with additional data
CREATE VIEW public.reports_with_details AS
SELECT 
  r.*,
  p.full_name as reporter_name,
  p.avatar_url as reporter_avatar,
  (SELECT COUNT(*) FROM public.report_votes WHERE report_id = r.id) as vote_count,
  (SELECT COUNT(*) FROM public.report_comments WHERE report_id = r.id) as comment_count
FROM public.reports r
LEFT JOIN public.profiles p ON r.user_id = p.id;

-- Grant access to the view
GRANT SELECT ON public.reports_with_details TO authenticated;
GRANT SELECT ON public.reports_with_details TO anon;
