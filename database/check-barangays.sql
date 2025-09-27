-- Check existing barangay codes in the database
-- Run this to see what barangay codes are available

SELECT 
  code,
  name,
  'Available for admin assignment' as status
FROM barangays 
ORDER BY code
LIMIT 10;

-- Count total barangays
SELECT 
  COUNT(*) as total_barangays,
  'Total barangays in database' as description
FROM barangays;
