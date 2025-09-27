// Simple Authentication Types for Fix My Barangay

export type UserRole = 'resident' | 'barangay_admin' | 'guest';

export interface UserProfile {
  id: string;
  email?: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  barangay_code: string;
  barangay_name: string;
  role: UserRole;
  is_verified: boolean;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Barangay {
  code: string;
  name: string;
  admin_user_id?: string;
  created_at: string;
}

export interface RegistrationData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone_number?: string;
  barangay_code: string;
  barangay_name: string;
}

// Simple barangay list
export const SURIGAO_BARANGAYS = [
  { code: 'ALANG_ALANG', name: 'Alang-alang' },
  { code: 'ANOMAR', name: 'Anomar' },
  { code: 'AURORA', name: 'Aurora' },
  { code: 'BILABID', name: 'Bilabid' },
  { code: 'BONIFACIO', name: 'Bonifacio' },
  { code: 'BUGSUKAN', name: 'Bugsukan' },
  { code: 'CANLANIPA', name: 'Canlanipa' },
  { code: 'DANAWAN', name: 'Danawan' },
  { code: 'HABAY', name: 'Habay' },
  { code: 'IPIL', name: 'Ipil' },
  { code: 'LIPATA', name: 'Lipata' },
  { code: 'LUNA', name: 'Luna' },
  { code: 'MABINI', name: 'Mabini' },
  { code: 'MABUA', name: 'Mabua' },
  { code: 'MAPAWA', name: 'Mapawa' },
  { code: 'NONOC', name: 'Nonoc' },
  { code: 'OROK', name: 'Orok' },
  { code: 'POCTOY', name: 'Poctoy' },
  { code: 'POBLACION', name: 'Poblacion' },
  { code: 'QUEZON', name: 'Quezon' },
  { code: 'RIZAL', name: 'Rizal' },
  { code: 'SAN_JUAN', name: 'San Juan' },
  { code: 'SAN_MATEO', name: 'San Mateo' },
  { code: 'SAN_PEDRO', name: 'San Pedro' },
  { code: 'SILOP', name: 'Silop' },
  { code: 'SUKAILANG', name: 'Sukailang' },
  { code: 'TAFT', name: 'Taft' },
  { code: 'TRINIDAD', name: 'Trinidad' },
  { code: 'WASHINGTON', name: 'Washington' },
  { code: 'BUENAVISTA', name: 'Buenavista' },
  { code: 'CAPALAYAN', name: 'Capalayan' },
  { code: 'JUBGAN', name: 'Jubgan' },
  { code: 'MAG_ASO', name: 'Mag-aso' },
  { code: 'MATALINGAO', name: 'Matalingao' },
  { code: 'SABANG', name: 'Sabang' },
  { code: 'SACA', name: 'Saca' },
  { code: 'TAGANA_AN', name: 'Tagana-an' },
  { code: 'TOGBONGON', name: 'Togbongon' },
];
