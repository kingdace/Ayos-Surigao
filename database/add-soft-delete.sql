-- Add soft delete functionality for reports
-- This allows SuperAdmin to "delete" reports while maintaining data integrity

-- Step 1: Add deleted column to reports table
ALTER TABLE public.reports 
ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT FALSE;

-- Step 2: Add deleted_by column to track who deleted the report
ALTER TABLE public.reports 
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES public.admin_accounts(id);

-- Step 3: Add deleted_at column to track when the report was deleted
ALTER TABLE public.reports 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Step 4: Create index for better performance on deleted queries
CREATE INDEX IF NOT EXISTS idx_reports_deleted ON public.reports(deleted);

-- Step 5: Create RLS policy for SuperAdmin deletion
DROP POLICY IF EXISTS "SuperAdmin can delete reports" ON public.reports;

CREATE POLICY "SuperAdmin can delete reports" ON public.reports
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.admin_accounts 
      WHERE id = auth.uid() 
      AND role = 'super_admin'
      AND is_active = true
    )
  );

-- Step 6: Create function to soft delete a report
CREATE OR REPLACE FUNCTION soft_delete_report(report_id UUID, admin_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if the admin is a super_admin
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_accounts 
    WHERE id = admin_id 
    AND role = 'super_admin' 
    AND is_active = true
  ) THEN
    RETURN FALSE;
  END IF;

  -- Soft delete the report
  UPDATE public.reports 
  SET 
    deleted = TRUE,
    deleted_by = admin_id,
    deleted_at = NOW()
  WHERE id = report_id 
  AND deleted = FALSE;

  -- Return true if a row was updated
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Create function to restore a deleted report (for recovery)
CREATE OR REPLACE FUNCTION restore_deleted_report(report_id UUID, admin_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if the admin is a super_admin
  IF NOT EXISTS (
    SELECT 1 FROM public.admin_accounts 
    WHERE id = admin_id 
    AND role = 'super_admin' 
    AND is_active = true
  ) THEN
    RETURN FALSE;
  END IF;

  -- Restore the report
  UPDATE public.reports 
  SET 
    deleted = FALSE,
    deleted_by = NULL,
    deleted_at = NULL
  WHERE id = report_id 
  AND deleted = TRUE;

  -- Return true if a row was updated
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Grant necessary permissions
GRANT EXECUTE ON FUNCTION soft_delete_report(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION restore_deleted_report(UUID, UUID) TO authenticated;
