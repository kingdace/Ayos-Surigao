-- Update the reports_with_details view to include soft delete columns and filtering
-- This script fixes the view to work with the soft delete functionality

-- Step 1: Drop the existing view if it exists
DROP VIEW IF EXISTS public.reports_with_details;

-- Step 2: Create the updated view with soft delete support
CREATE VIEW public.reports_with_details AS
SELECT 
    r.*,
    p.first_name as reporter_first_name,
    p.last_name as reporter_last_name,
    p.avatar_url as reporter_avatar,
    CONCAT(p.first_name, ' ', p.last_name) as reporter_name
    -- Note: barangay_name already exists in reports table, so we don't need to add it again
FROM public.reports r
LEFT JOIN public.profiles p ON r.reporter_id = p.id
LEFT JOIN public.barangays b ON r.barangay_code = b.code
WHERE r.deleted = false; -- Only show non-deleted reports

-- Step 3: Grant necessary permissions
GRANT SELECT ON public.reports_with_details TO authenticated;
GRANT SELECT ON public.reports_with_details TO anon;

-- Step 4: Test the view
SELECT 
    COUNT(*) as total_active_reports,
    COUNT(CASE WHEN deleted = false THEN 1 END) as non_deleted_count,
    COUNT(CASE WHEN deleted = true THEN 1 END) as deleted_count
FROM public.reports;

-- Step 5: Test the view directly
SELECT 
    id, 
    title, 
    status, 
    deleted, 
    deleted_by, 
    deleted_at
FROM public.reports_with_details 
LIMIT 5;
