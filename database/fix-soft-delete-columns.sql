-- Fix soft delete columns issue
-- This script ensures the columns are properly added and the view is updated

-- Step 1: Check if columns exist in the reports table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'reports' 
AND column_name IN ('deleted', 'deleted_by', 'deleted_at')
ORDER BY column_name;

-- Step 2: If columns don't exist, add them
DO $$
BEGIN
    -- Add deleted column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reports' AND column_name = 'deleted'
    ) THEN
        ALTER TABLE public.reports ADD COLUMN deleted BOOLEAN DEFAULT FALSE;
    END IF;

    -- Add deleted_by column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reports' AND column_name = 'deleted_by'
    ) THEN
        ALTER TABLE public.reports ADD COLUMN deleted_by UUID REFERENCES public.admin_accounts(id);
    END IF;

    -- Add deleted_at column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'reports' AND column_name = 'deleted_at'
    ) THEN
        ALTER TABLE public.reports ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Step 3: Create or replace the reports_with_details view to include the new columns
CREATE OR REPLACE VIEW public.reports_with_details AS
SELECT 
    r.*,
    p.first_name as reporter_first_name,
    p.last_name as reporter_last_name,
    p.avatar_url as reporter_avatar,
    CONCAT(p.first_name, ' ', p.last_name) as reporter_name,
    b.name as barangay_name
FROM public.reports r
LEFT JOIN public.profiles p ON r.reporter_id = p.id
LEFT JOIN public.barangays b ON r.barangay_code = b.code
WHERE r.deleted = false; -- Only show non-deleted reports

-- Step 4: Create index for better performance
CREATE INDEX IF NOT EXISTS idx_reports_deleted ON public.reports(deleted);

-- Step 5: Verify the columns now exist
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'reports' 
AND column_name IN ('deleted', 'deleted_by', 'deleted_at')
ORDER BY column_name;

-- Step 6: Test the view
SELECT COUNT(*) as total_reports, 
       COUNT(CASE WHEN deleted = false THEN 1 END) as active_reports,
       COUNT(CASE WHEN deleted = true THEN 1 END) as deleted_reports
FROM public.reports;
