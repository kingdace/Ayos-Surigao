// TypeScript types for Fix My Barangay database

export type ReportCategory = 
  | 'broken_lights'
  | 'trash_collection'
  | 'water_issues'
  | 'road_damage'
  | 'drainage'
  | 'public_safety'
  | 'noise_complaint'
  | 'other';

export type ReportStatus = 
  | 'pending'
  | 'in_progress'
  | 'resolved'
  | 'rejected';

export type ReportPriority = 
  | 'low'
  | 'medium'
  | 'high'
  | 'urgent';

export interface Profile {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  phone_number?: string;
  barangay?: string;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: ReportCategory;
  status: ReportStatus;
  priority: ReportPriority;
  
  // Location
  latitude?: number;
  longitude?: number;
  address?: string;
  barangay?: string;
  
  // Media
  photo_url?: string;
  photo_urls?: string[];
  
  // Timestamps
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  resolved_by?: string;
  admin_notes?: string;
}

export interface ReportComment {
  id: string;
  report_id: string;
  user_id: string;
  comment: string;
  is_admin_comment: boolean;
  created_at: string;
}

export interface ReportVote {
  id: string;
  report_id: string;
  user_id: string;
  created_at: string;
}

export interface ReportWithDetails extends Report {
  reporter_name?: string;
  reporter_avatar?: string;
  vote_count: number;
  comment_count: number;
}

// Form types for creating/updating
export interface CreateReportData {
  title: string;
  description: string;
  category: ReportCategory;
  latitude?: number;
  longitude?: number;
  address?: string;
  barangay?: string;
  photo_url?: string;
  photo_urls?: string[];
}

export interface UpdateReportData {
  title?: string;
  description?: string;
  category?: ReportCategory;
  status?: ReportStatus;
  priority?: ReportPriority;
  admin_notes?: string;
  resolved_at?: string;
  resolved_by?: string;
}

// Category display information
export const CATEGORY_INFO: Record<ReportCategory, { label: string; icon: string; color: string }> = {
  broken_lights: { label: 'Broken Lights', icon: '💡', color: '#FFA500' },
  trash_collection: { label: 'Trash Collection', icon: '🗑️', color: '#8B4513' },
  water_issues: { label: 'Water Issues', icon: '💧', color: '#4169E1' },
  road_damage: { label: 'Road Damage', icon: '🛣️', color: '#696969' },
  drainage: { label: 'Drainage', icon: '🌊', color: '#20B2AA' },
  public_safety: { label: 'Public Safety', icon: '🚨', color: '#DC143C' },
  noise_complaint: { label: 'Noise Complaint', icon: '🔊', color: '#FF6347' },
  other: { label: 'Other', icon: '📝', color: '#9370DB' }
};

// Status display information
export const STATUS_INFO: Record<ReportStatus, { label: string; color: string }> = {
  pending: { label: 'Pending', color: '#FFA500' },
  in_progress: { label: 'In Progress', color: '#4169E1' },
  resolved: { label: 'Resolved', color: '#32CD32' },
  rejected: { label: 'Rejected', color: '#DC143C' }
};

// Priority display information
export const PRIORITY_INFO: Record<ReportPriority, { label: string; color: string }> = {
  low: { label: 'Low', color: '#32CD32' },
  medium: { label: 'Medium', color: '#FFA500' },
  high: { label: 'High', color: '#FF6347' },
  urgent: { label: 'Urgent', color: '#DC143C' }
};
