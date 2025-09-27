-- Fix RLS policies to allow guest users to create reports
-- Run this in your Supabase SQL Editor to enable anonymous report creation

-- First, let's check the current policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'reports' 
ORDER BY policyname;

-- Add a new policy to allow anonymous users to create reports
-- This policy allows anonymous users to insert reports with is_anonymous = true
DROP POLICY IF EXISTS "Anonymous users can create anonymous reports" ON public.reports;
CREATE POLICY "Anonymous users can create anonymous reports" ON public.reports
  FOR INSERT WITH CHECK (
    auth.role() = 'anon' AND 
    is_anonymous = true AND 
    user_id IS NULL AND 
    reporter_id IS NULL
  );

-- Also allow authenticated users to create both anonymous and non-anonymous reports
-- Update the existing policy to be more flexible
DROP POLICY IF EXISTS "Authenticated users can create reports" ON public.reports;
CREATE POLICY "Authenticated users can create reports" ON public.reports
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Ensure the reports table allows NULL values for user_id and reporter_id
-- (This should already be set up, but let's make sure)
ALTER TABLE public.reports ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.reports ALTER COLUMN reporter_id DROP NOT NULL;

-- Make sure the is_anonymous column has a default value
ALTER TABLE public.reports ALTER COLUMN is_anonymous SET DEFAULT false;

-- Success message
SELECT 'Guest report creation RLS policies updated successfully! Anonymous users can now create reports.' as status;
