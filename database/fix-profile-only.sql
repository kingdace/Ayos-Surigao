-- Fix Profile Creation Only
-- This script ONLY adds the missing profile creation functionality
-- without touching existing tables

-- Step 1: Create the handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, barangay_code, barangay_name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'barangay_code', 'POBLACION'),
    COALESCE(NEW.raw_user_meta_data->>'barangay_name', 'Poblacion'),
    'resident'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Create the trigger (drop existing first to avoid conflicts)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 3: Success message
SELECT 'Profile creation function and trigger added successfully! Registration should now work properly.' as status;
