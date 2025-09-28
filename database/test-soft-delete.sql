-- Test script for soft delete functionality
-- Run this after applying the add-soft-delete.sql script

-- Test 1: Check if the columns were added successfully
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'reports' 
AND column_name IN ('deleted', 'deleted_by', 'deleted_at')
ORDER BY column_name;

-- Test 2: Check if the functions were created
SELECT 
  routine_name, 
  routine_type, 
  data_type
FROM information_schema.routines 
WHERE routine_name IN ('soft_delete_report', 'restore_deleted_report')
ORDER BY routine_name;

-- Test 3: Check if the RLS policy was created
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd
FROM pg_policies 
WHERE tablename = 'reports' 
AND policyname = 'SuperAdmin can delete reports';

-- Test 4: Test the soft delete function (replace with actual admin ID)
-- This will only work if you have a super_admin account
/*
SELECT soft_delete_report(
  'your-report-id-here'::UUID, 
  'your-admin-id-here'::UUID
);
*/

-- Test 5: Check if reports are properly filtered (should show only non-deleted reports)
SELECT 
  id, 
  title, 
  status, 
  deleted, 
  deleted_by, 
  deleted_at
FROM reports 
WHERE deleted = false
LIMIT 5;

-- Test 6: Check if deleted reports are excluded from the view
-- This should return 0 rows if the view is working correctly
SELECT COUNT(*) as deleted_reports_count
FROM reports_with_details 
WHERE deleted = true;

-- Test 7: Verify index was created
SELECT 
  indexname, 
  indexdef
FROM pg_indexes 
WHERE tablename = 'reports' 
AND indexname = 'idx_reports_deleted';
