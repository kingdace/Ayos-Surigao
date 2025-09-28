-- Simple fix for admin status updates
-- This script ensures admin status updates work properly

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can update their own reports" ON public.reports;
DROP POLICY IF EXISTS "Operations staff can update reports" ON public.reports;
DROP POLICY IF EXISTS "Admins can update reports" ON public.reports;
DROP POLICY IF EXISTS "Admin accounts can update reports" ON public.reports;

-- Create a simple policy that allows all authenticated users to update reports
-- This is needed because the admin system doesn't use Supabase auth
CREATE POLICY "Allow report updates" ON public.reports
  FOR UPDATE USING (true);

-- Also allow updates for anonymous users (for guest reports)
CREATE POLICY "Allow anonymous report updates" ON public.reports
  FOR UPDATE USING (true);

-- Ensure report_comments allows admin comments
DROP POLICY IF EXISTS "Anyone can insert comments" ON public.report_comments;
CREATE POLICY "Allow comment insertion" ON public.report_comments
  FOR INSERT WITH CHECK (true);

-- Make sure the status column exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reports' AND column_name = 'status'
    ) THEN
        ALTER TABLE public.reports ADD COLUMN status TEXT DEFAULT 'pending';
    END IF;
END $$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);

-- Grant necessary permissions
GRANT UPDATE ON public.reports TO authenticated;
GRANT UPDATE ON public.reports TO anon;
GRANT INSERT ON public.report_comments TO authenticated;
GRANT INSERT ON public.report_comments TO anon;
GRANT SELECT ON public.reports TO authenticated;
GRANT SELECT ON public.reports TO anon;
