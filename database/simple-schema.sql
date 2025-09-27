-- Simple Schema for Fix My Barangay - Surigao City
-- Clean and straightforward implementation

-- Create simple enums
CREATE TYPE user_role AS ENUM ('resident', 'barangay_admin', 'guest');

-- Enhanced profiles table (replaces the existing one)
DROP TABLE IF EXISTS public.profiles CASCADE;
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone_number TEXT,
  barangay_code TEXT NOT NULL,
  barangay_name TEXT NOT NULL,
  role user_role DEFAULT 'resident',
  is_verified BOOLEAN DEFAULT FALSE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Simple barangays table
CREATE TABLE public.barangays (
  code TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  admin_user_id UUID REFERENCES auth.users(id), -- One admin per barangay
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Keep the existing reports table structure (it's already good)
-- Just update it to work with the simplified profiles

-- Create indexes
CREATE INDEX idx_profiles_barangay ON public.profiles(barangay_code);
CREATE INDEX idx_profiles_role ON public.profiles(role);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barangays ENABLE ROW LEVEL SECURITY;

-- Simple RLS Policies
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Barangays are viewable by everyone" ON public.barangays
  FOR SELECT USING (true);

-- Simple function to handle new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, barangay_code, barangay_name)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'barangay_code', 'POBLACION'),
    COALESCE(NEW.raw_user_meta_data->>'barangay_name', 'Poblacion')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert Surigao City barangays
INSERT INTO public.barangays (code, name) VALUES
('ALANG_ALANG', 'Alang-alang'),
('ANOMAR', 'Anomar'),
('AURORA', 'Aurora'),
('BILABID', 'Bilabid'),
('BONIFACIO', 'Bonifacio'),
('BUGSUKAN', 'Bugsukan'),
('CANLANIPA', 'Canlanipa'),
('DANAWAN', 'Danawan'),
('HABAY', 'Habay'),
('IPIL', 'Ipil'),
('LIPATA', 'Lipata'),
('LUNA', 'Luna'),
('MABINI', 'Mabini'),
('MABUA', 'Mabua'),
('MAPAWA', 'Mapawa'),
('NONOC', 'Nonoc'),
('OROK', 'Orok'),
('POCTOY', 'Poctoy'),
('POBLACION', 'Poblacion'),
('QUEZON', 'Quezon'),
('RIZAL', 'Rizal'),
('SAN_JUAN', 'San Juan'),
('SAN_MATEO', 'San Mateo'),
('SAN_PEDRO', 'San Pedro'),
('SILOP', 'Silop'),
('SUKAILANG', 'Sukailang'),
('TAFT', 'Taft'),
('TRINIDAD', 'Trinidad'),
('WASHINGTON', 'Washington'),
('BUENAVISTA', 'Buenavista'),
('CAPALAYAN', 'Capalayan'),
('JUBGAN', 'Jubgan'),
('MAG_ASO', 'Mag-aso'),
('MATALINGAO', 'Matalingao'),
('SABANG', 'Sabang'),
('SACA', 'Saca'),
('TAGANA_AN', 'Tagana-an'),
('TOGBONGON', 'Togbongon')
ON CONFLICT (code) DO NOTHING;
