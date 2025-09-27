// Authentication and User Management Types for Fix My Barangay

export type UserRole = 
  | 'resident'           // Regular residents
  | 'guest'             // Anonymous/guest users
  | 'barangay_captain'  // Barangay Captain (full admin for their barangay)
  | 'barangay_secretary'// Barangay Secretary (can manage reports)
  | 'barangay_kagawad'  // Barangay Kagawad (can view and comment)
  | 'city_admin'        // City-level admin (you)
  | 'city_staff'        // City IT staff
  | 'department_head';  // Department heads

export type UserStatus = 
  | 'active'
  | 'pending_verification'
  | 'suspended'
  | 'inactive';

export type VerificationType = 
  | 'email'      // Free email verification via Supabase
  | 'manual'     // Verified by barangay official in person
  | 'community'  // Vouched for by verified community members
  | 'none';      // Guest users or unverified

export interface UserProfile {
  id: string;
  email?: string;
  
  // Personal Information
  first_name: string;
  last_name: string;
  middle_name?: string;
  phone_number?: string;
  
  // Location Information
  barangay_code: string;
  barangay_name: string;
  street_address?: string;
  
  // Account Information
  role: UserRole;
  status: UserStatus;
  verification_type: VerificationType;
  verified_at?: string;
  verified_by?: string; // ID of the person who verified (for manual verification)
  
  // Metadata
  avatar_url?: string;
  is_guest: boolean;
  guest_session_id?: string; // For guest users
  last_active_at?: string;
  created_at: string;
  updated_at: string;
}

export interface BarangayOfficial {
  id: string;
  user_id: string;
  barangay_code: string;
  barangay_name: string;
  position: 'captain' | 'secretary' | 'kagawad';
  appointed_by: string; // City admin who appointed them
  appointed_at: string;
  is_active: boolean;
  contact_info?: {
    office_phone?: string;
    office_email?: string;
    office_address?: string;
  };
}

export interface GuestSession {
  id: string;
  session_token: string;
  device_info?: string;
  ip_address?: string;
  barangay_code?: string; // Optional: guest can select barangay for reporting
  created_at: string;
  expires_at: string;
  last_used_at: string;
}

// Registration form types
export interface ResidentRegistrationData {
  first_name: string;
  last_name: string;
  middle_name?: string;
  email: string;
  password: string;
  phone_number?: string;
  barangay_code: string;
  street_address?: string;
}

export interface BarangayOfficialRegistrationData {
  first_name: string;
  last_name: string;
  middle_name?: string;
  email: string;
  password: string;
  phone_number: string;
  barangay_code: string;
  position: 'captain' | 'secretary' | 'kagawad';
  office_phone?: string;
  office_email?: string;
  office_address?: string;
}

// Permission definitions
export const PERMISSIONS = {
  // Report permissions
  VIEW_ALL_REPORTS: ['city_admin', 'city_staff', 'department_head'],
  VIEW_BARANGAY_REPORTS: ['barangay_captain', 'barangay_secretary', 'barangay_kagawad'],
  CREATE_REPORT: ['resident', 'guest'],
  UPDATE_REPORT_STATUS: ['barangay_captain', 'barangay_secretary', 'city_admin'],
  DELETE_REPORT: ['city_admin'],
  
  // User management permissions
  MANAGE_USERS: ['city_admin'],
  MANAGE_BARANGAY_OFFICIALS: ['city_admin'],
  VIEW_USER_DETAILS: ['barangay_captain', 'barangay_secretary', 'city_admin'],
  
  // System permissions
  ACCESS_ADMIN_PANEL: ['city_admin', 'city_staff'],
  MANAGE_BARANGAY_DATA: ['city_admin'],
  GENERATE_REPORTS: ['barangay_captain', 'city_admin', 'department_head'],
} as const;

export const hasPermission = (userRole: UserRole, permission: keyof typeof PERMISSIONS): boolean => {
  return (PERMISSIONS[permission] as readonly UserRole[]).includes(userRole);
};
