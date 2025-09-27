-- Test Admin Login Credentials
-- Run this to verify admin accounts exist and are active

SELECT 
  email,
  first_name,
  last_name,
  role,
  is_active,
  CASE 
    WHEN is_active = true THEN '✅ ACTIVE'
    ELSE '❌ INACTIVE'
  END as status
FROM admin_accounts 
ORDER BY role, email;

-- Test specific credentials
SELECT 
  'Testing Super Admin Login' as test_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM admin_accounts 
      WHERE email = 'admin@ayossurigao.com' 
      AND is_active = true 
      AND role = 'super_admin'
    ) THEN '✅ SUPER ADMIN READY'
    ELSE '❌ SUPER ADMIN NOT FOUND'
  END as result;

SELECT 
  'Testing Operations Manager Login' as test_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM admin_accounts 
      WHERE email = 'ops@ayossurigao.com' 
      AND is_active = true 
      AND role = 'operations_manager'
    ) THEN '✅ OPS MANAGER READY'
    ELSE '❌ OPS MANAGER NOT FOUND'
  END as result;
