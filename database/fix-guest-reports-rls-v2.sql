-- Fix RLS policies to allow guest users to create reports - V2
-- Run this in your Supabase SQL Editor to enable anonymous report creation

-- First, let's check the current policies and see what's happening
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'reports' 
ORDER BY policyname;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Reports are viewable by everyone" ON public.reports;
DROP POLICY IF EXISTS "Authenticated users can create reports" ON public.reports;
DROP POLICY IF EXISTS "Users can update their own reports" ON public.reports;
DROP POLICY IF EXISTS "Barangay admins can update reports in their barangay" ON public.reports;
DROP POLICY IF EXISTS "Anonymous users can create anonymous reports" ON public.reports;

-- Create comprehensive policies for reports table

-- 1. Allow everyone to view reports
CREATE POLICY "Reports are viewable by everyone" ON public.reports
  FOR SELECT USING (true);

-- 2. Allow authenticated users to create any reports
CREATE POLICY "Authenticated users can create reports" ON public.reports
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 3. Allow anonymous users to create anonymous reports
-- This is the key policy for guest users
CREATE POLICY "Anonymous users can create anonymous reports" ON public.reports
  FOR INSERT WITH CHECK (
    auth.role() = 'anon' AND 
    is_anonymous = true
  );

-- 4. Allow users to update their own reports
CREATE POLICY "Users can update their own reports" ON public.reports
  FOR UPDATE USING (auth.uid() = user_id);

-- 5. Allow barangay admins to update reports in their barangay
CREATE POLICY "Barangay admins can update reports in their barangay" ON public.reports
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() 
      AND role = 'barangay_admin' 
      AND barangay_code = reports.barangay_code
    )
  );

-- Ensure the reports table allows NULL values for user_id and reporter_id
ALTER TABLE public.reports ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.reports ALTER COLUMN reporter_id DROP NOT NULL;

-- Make sure the is_anonymous column has a default value
ALTER TABLE public.reports ALTER COLUMN is_anonymous SET DEFAULT false;

-- Check if the table structure is correct
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'reports' 
AND column_name IN ('user_id', 'reporter_id', 'is_anonymous')
ORDER BY column_name;

-- Test the policies by checking what auth.role() returns
SELECT 
  'Current auth role: ' || COALESCE(auth.role(), 'NULL') as auth_info,
  'Current auth uid: ' || COALESCE(auth.uid()::text, 'NULL') as uid_info;

-- Success message
SELECT 'Guest report creation RLS policies updated successfully! Anonymous users can now create reports.' as status;
