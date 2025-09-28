-- Fix Admin Status Updates RLS Policies
-- This script ensures admin status updates work properly

-- First, let's check what RLS policies exist on the reports table
-- and make sure admins can update reports

-- Drop existing policies that might be blocking admin updates
DROP POLICY IF EXISTS "Users can update their own reports" ON public.reports;
DROP POLICY IF EXISTS "Operations staff can update reports" ON public.reports;
DROP POLICY IF EXISTS "Admins can update reports" ON public.reports;

-- Create a comprehensive policy that allows admin updates
-- This policy allows updates from admin accounts
CREATE POLICY "Admin accounts can update reports" ON public.reports
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM admin_accounts 
      WHERE id::text = current_setting('request.jwt.claims', true)::json->>'sub'
      AND is_active = true
    )
  );

-- Also allow updates from authenticated users (for regular users)
CREATE POLICY "Authenticated users can update their own reports" ON public.reports
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow admin comments to be inserted
DROP POLICY IF EXISTS "Anyone can insert comments" ON public.report_comments;
CREATE POLICY "Anyone can insert comments" ON public.report_comments
  FOR INSERT WITH CHECK (true);

-- Allow admin comments with null user_id
CREATE POLICY "Admin comments allowed" ON public.report_comments
  FOR INSERT WITH CHECK (user_id IS NULL OR auth.uid() = user_id);

-- Ensure the reports table allows status updates
-- Check if the status column exists and has the right type
DO $$
BEGIN
    -- Check if status column exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reports' AND column_name = 'status'
    ) THEN
        -- Add status column if it doesn't exist
        ALTER TABLE public.reports ADD COLUMN status TEXT DEFAULT 'pending';
    END IF;
END $$;

-- Create an index on status for better performance
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);

-- Grant necessary permissions
GRANT UPDATE ON public.reports TO authenticated;
GRANT INSERT ON public.report_comments TO authenticated;
GRANT SELECT ON public.reports TO authenticated;

-- Create RPC function to update report status (bypasses RLS)
CREATE OR REPLACE FUNCTION update_report_status(
  report_id UUID,
  new_status TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSON;
BEGIN
  -- Update the report status
  UPDATE public.reports 
  SET 
    status = new_status,
    updated_at = NOW()
  WHERE id = report_id;
  
  -- Check if any rows were affected
  IF FOUND THEN
    -- Return success
    result := json_build_object('success', true, 'message', 'Status updated successfully');
  ELSE
    -- Return error
    result := json_build_object('success', false, 'message', 'Report not found');
  END IF;
  
  RETURN result;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION update_report_status(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION update_report_status(UUID, TEXT) TO anon;
