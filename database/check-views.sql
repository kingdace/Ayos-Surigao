-- Check existing views and their definitions
-- This will help us understand the current database structure

-- Check all views that reference the reports table
SELECT 
    schemaname,
    viewname,
    definition
FROM pg_views 
WHERE definition ILIKE '%reports%'
ORDER BY viewname;

-- Check if reports_with_details view exists and its definition
SELECT 
    schemaname,
    viewname,
    definition
FROM pg_views 
WHERE viewname = 'reports_with_details';

-- Check the current structure of the reports table
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'reports' 
ORDER BY ordinal_position;
