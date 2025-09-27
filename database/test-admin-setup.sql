-- Test Admin Setup
-- Run this after applying admin-schema.sql and admin-seeder.sql

-- Test 1: Check if admin tables exist
SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('admin_accounts', 'report_assignments', 'report_status_history', 'admin_comments', 'admin_settings') 
    THEN '✅ EXISTS' 
    ELSE '❌ MISSING' 
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%admin%' OR table_name LIKE '%assignment%'
ORDER BY table_name;

-- Test 2: Check if admin accounts were created
SELECT 
  email,
  first_name,
  last_name,
  role,
  is_active,
  CASE 
    WHEN email = 'admin@ayossurigao.com' AND role = 'super_admin' 
    THEN '✅ SUPER ADMIN' 
    ELSE '✅ CREATED' 
  END as status
FROM admin_accounts 
ORDER BY created_at;

-- Test 3: Check if settings were created
SELECT 
  key,
  value,
  CASE 
    WHEN key = 'system_name' AND value = 'Ayos Surigao Operations Center'
    THEN '✅ SETTINGS OK'
    ELSE '✅ SETTING CREATED'
  END as status
FROM admin_settings 
ORDER BY key;

-- Test 4: Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  CASE 
    WHEN policyname LIKE '%admin%' 
    THEN '✅ POLICY EXISTS'
    ELSE '✅ POLICY CREATED'
  END as status
FROM pg_policies 
WHERE tablename IN ('admin_accounts', 'report_assignments', 'report_status_history', 'admin_comments', 'admin_settings')
ORDER BY tablename, policyname;

-- Test 5: Check if admin_role enum exists
SELECT 
  typname as enum_name,
  CASE 
    WHEN typname = 'admin_role' 
    THEN '✅ ENUM EXISTS'
    ELSE '❌ ENUM MISSING'
  END as status
FROM pg_type 
WHERE typtype = 'e' AND typname = 'admin_role';

-- Success message
SELECT 'Admin setup test completed! Check the results above.' as test_status;
