// Fix My Barangay - Centralized Operations Center Types
// TypeScript definitions for the centralized admin system

// Enhanced user roles for centralized operations
export type UserRole =
  | "resident" // Regular citizens
  | "guest" // Anonymous users
  | "operations_manager" // Overall coordination
  | "system_admin" // Technical management
  | "field_coordinator" // Geographic coverage coordinators
  | "data_analyst" // Reports and insights
  | "super_admin"; // System owner

// Report categories aligned with Surigao City needs
export type ReportCategory =
  | "roads_infrastructure"
  | "utilities_power"
  | "water_sanitation"
  | "waste_management"
  | "public_safety"
  | "streetlights"
  | "drainage_flooding"
  | "public_facilities"
  | "environmental"
  | "other";

// Report status workflow for operations center
export type ReportStatus =
  | "submitted" // Initial submission
  | "triaged" // Categorized by operations center
  | "assigned" // Assigned to field coordinator
  | "in_progress" // Being worked on
  | "forwarded" // Sent to barangay official
  | "resolved" // Issue fixed
  | "closed" // Closed (resolved or rejected)
  | "reopened"; // Reopened for follow-up

// Urgency levels for prioritization
export type UrgencyLevel = "low" | "medium" | "high" | "emergency";

// Geographic zones for field coordinators
export type CoordinatorZone = "north" | "central" | "south" | "citywide";

// Department types for operations staff
export type Department =
  | "operations"
  | "technical"
  | "field"
  | "analytics"
  | "management";

// Enhanced user profile for centralized system
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

  // Admin-specific fields
  coordinator_zone?: CoordinatorZone;
  specialization?: ReportCategory[];

  // Resident-specific fields
  address?: string;

  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Operations staff member
export interface OperationsStaff {
  id: string;
  user_id: string;
  staff_id: string; // e.g., 'OM001', 'FC001'
  department: Department;
  supervisor_id?: string;
  shift_schedule?: string; // 'morning', 'afternoon', 'night', 'flexible'
  contact_number?: string;
  emergency_contact?: string;
  is_on_duty: boolean;
  hire_date: string;
  created_at: string;

  // Joined data
  profile?: UserProfile;
  supervisor?: OperationsStaff;
  subordinates?: OperationsStaff[];
}

// Comprehensive report interface
export interface Report {
  id: string;
  report_number: string; // Auto-generated: FMB-2024-001234

  // Report Content
  title: string;
  description: string;
  category: ReportCategory;
  subcategory?: string;
  urgency: UrgencyLevel;

  // Location Information
  barangay_code: string;
  barangay_name: string;
  specific_location?: string;
  latitude?: number;
  longitude?: number;
  location_accuracy?: number;

  // Reporter Information
  reporter_id?: string;
  reporter_name?: string; // For guest reports
  reporter_contact?: string; // For guest reports
  is_anonymous: boolean;

  // Status & Workflow
  status: ReportStatus;
  priority_score: number; // 0-100 calculated score
  estimated_cost?: number;

  // Assignment & Tracking
  assigned_to?: string;
  assigned_at?: string;
  triaged_by?: string;
  triaged_at?: string;

  // Barangay Communication
  barangay_contact_name?: string;
  barangay_contact_number?: string;
  barangay_notification_sent: boolean;
  barangay_notification_date?: string;

  // Resolution Information
  resolution_notes?: string;
  resolution_cost?: number;
  resolved_by?: string;
  resolved_at?: string;

  // Engagement Metrics
  views_count: number;
  likes_count: number;

  // Timestamps
  created_at: string;
  updated_at: string;

  // Joined data
  reporter?: UserProfile;
  assigned_staff?: OperationsStaff;
  attachments?: ReportAttachment[];
  status_history?: ReportStatusHistory[];
  comments?: ReportComment[];
  engagements?: ReportEngagement[];
}

// Report attachment/media
export interface ReportAttachment {
  id: string;
  report_id: string;
  file_url: string;
  file_type: "image" | "document" | "video";
  file_size?: number;
  caption?: string;
  is_before_photo: boolean;
  uploaded_by?: string;
  created_at: string;
}

// Report status change history
export interface ReportStatusHistory {
  id: string;
  report_id: string;
  old_status?: ReportStatus;
  new_status: ReportStatus;
  changed_by?: string;
  notes?: string;
  created_at: string;

  // Joined data
  changed_by_user?: UserProfile;
}

// Community engagement on reports
export interface ReportEngagement {
  id: string;
  report_id: string;
  user_id?: string;
  engagement_type: "like" | "important" | "watching";
  created_at: string;

  // Joined data
  user?: UserProfile;
}

// Comments and updates on reports
export interface ReportComment {
  id: string;
  report_id: string;
  user_id?: string;
  comment: string;
  is_internal: boolean; // Internal operations notes vs public comments
  is_official_update: boolean; // Official status updates
  created_at: string;

  // Joined data
  user?: UserProfile;
}

// Barangay officials directory
export interface BarangayOfficial {
  id: string;
  barangay_code: string;
  name: string;
  position: "captain" | "secretary" | "kagawad" | "sk_chairman";
  contact_number?: string;
  email?: string;
  is_primary_contact: boolean;
  is_active: boolean;
  created_at: string;
}

// System notifications
export interface SystemNotification {
  id: string;
  recipient_id?: string;
  title: string;
  message: string;
  type:
    | "report_assigned"
    | "status_update"
    | "system_alert"
    | "barangay_notification";
  related_report_id?: string;
  is_read: boolean;
  priority: UrgencyLevel;
  created_at: string;

  // Joined data
  recipient?: UserProfile;
  related_report?: Report;
}

// Analytics and performance metrics
export interface AnalyticsSummary {
  id: string;
  period_start: string;
  period_end: string;
  barangay_code?: string;
  total_reports: number;
  resolved_reports: number;
  average_resolution_time?: string; // ISO 8601 duration
  total_cost: number;
  staff_member?: string;
  created_at: string;

  // Calculated fields
  resolution_rate?: number; // percentage
  average_resolution_days?: number;
}

// Report creation form data
export interface CreateReportData {
  title: string;
  description: string;
  category: ReportCategory;
  subcategory?: string;
  urgency: UrgencyLevel;
  specific_location?: string;
  latitude?: number;
  longitude?: number;
  is_anonymous?: boolean;
  attachments?: File[] | string[]; // File objects or URLs
}

// Report update data for operations center
export interface UpdateReportData {
  status?: ReportStatus;
  assigned_to?: string;
  urgency?: UrgencyLevel;
  estimated_cost?: number;
  resolution_notes?: string;
  resolution_cost?: number;
  resolved_by?: string;
  barangay_contact_name?: string;
  barangay_contact_number?: string;
  internal_notes?: string;
}

// Dashboard statistics
export interface DashboardStats {
  total_reports: number;
  pending_reports: number;
  in_progress_reports: number;
  resolved_reports: number;
  emergency_reports: number;
  today_reports: number;
  resolution_rate: number;
  average_resolution_time: number;
  most_reported_category: ReportCategory;
  most_active_barangay: string;
  staff_performance: StaffPerformance[];
}

// Staff performance metrics
export interface StaffPerformance {
  staff_id: string;
  staff_name: string;
  assigned_reports: number;
  resolved_reports: number;
  average_resolution_time: number;
  performance_score: number;
}

// Report filters for searching and filtering
export interface ReportFilters {
  status?: ReportStatus[];
  category?: ReportCategory[];
  urgency?: UrgencyLevel[];
  barangay_code?: string[];
  assigned_to?: string[];
  date_from?: string;
  date_to?: string;
  search_query?: string;
  reporter_id?: string;
  has_attachments?: boolean;
  is_resolved?: boolean;
}

// Pagination for report lists
export interface PaginationParams {
  page?: number;
  limit?: number;
  sort_by?: "created_at" | "updated_at" | "priority_score" | "status";
  sort_order?: "asc" | "desc";
}

// API response wrapper
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

// Category configuration for UI
export interface CategoryConfig {
  key: ReportCategory;
  label: string;
  icon: string;
  color: string;
  description: string;
  subcategories?: string[];
}

// Workflow configuration
export interface WorkflowStep {
  status: ReportStatus;
  label: string;
  description: string;
  next_statuses: ReportStatus[];
  required_role: UserRole[];
  auto_assign?: boolean;
}

// Notification preferences
export interface NotificationPreferences {
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  sms_notifications: boolean;
  notification_types: {
    report_assigned: boolean;
    status_updates: boolean;
    system_alerts: boolean;
    daily_summary: boolean;
  };
}

// Export all category configurations
export const REPORT_CATEGORIES: CategoryConfig[] = [
  {
    key: "roads_infrastructure",
    label: "Roads & Infrastructure",
    icon: "🛣️",
    color: "#FF9B00",
    description: "Potholes, damaged roads, bridges, sidewalks",
    subcategories: [
      "Potholes",
      "Damaged Pavement",
      "Bridge Issues",
      "Sidewalk Problems",
    ],
  },
  {
    key: "utilities_power",
    label: "Power & Utilities",
    icon: "⚡",
    color: "#FFE100",
    description: "Electrical issues, power outages, utility poles",
    subcategories: [
      "Power Outage",
      "Electrical Hazards",
      "Damaged Poles",
      "Transformer Issues",
    ],
  },
  {
    key: "water_sanitation",
    label: "Water & Sanitation",
    icon: "💧",
    color: "#17A2B8",
    description: "Water supply issues, leaks, sanitation problems",
    subcategories: [
      "Water Shortage",
      "Pipe Leaks",
      "Water Quality",
      "Sewage Issues",
    ],
  },
  {
    key: "waste_management",
    label: "Waste Management",
    icon: "🗑️",
    color: "#28A745",
    description: "Garbage collection, illegal dumping, recycling",
    subcategories: [
      "Missed Collection",
      "Illegal Dumping",
      "Overflowing Bins",
      "Recycling Issues",
    ],
  },
  {
    key: "public_safety",
    label: "Public Safety",
    icon: "🚨",
    color: "#DC3545",
    description: "Safety hazards, security concerns, emergency issues",
    subcategories: [
      "Safety Hazards",
      "Security Issues",
      "Emergency Response",
      "Crime Reports",
    ],
  },
  {
    key: "streetlights",
    label: "Street Lighting",
    icon: "💡",
    color: "#FFC900",
    description: "Broken streetlights, dark areas, lighting requests",
    subcategories: [
      "Broken Lights",
      "Dark Areas",
      "New Light Request",
      "Maintenance Needed",
    ],
  },
  {
    key: "drainage_flooding",
    label: "Drainage & Flooding",
    icon: "🌊",
    color: "#6C757D",
    description: "Clogged drains, flooding, water accumulation",
    subcategories: [
      "Clogged Drains",
      "Flooding",
      "Standing Water",
      "Poor Drainage",
    ],
  },
  {
    key: "public_facilities",
    label: "Public Facilities",
    icon: "🏛️",
    color: "#6F42C1",
    description: "Parks, playgrounds, public buildings, facilities",
    subcategories: [
      "Park Maintenance",
      "Playground Issues",
      "Building Problems",
      "Equipment Damage",
    ],
  },
  {
    key: "environmental",
    label: "Environmental",
    icon: "🌱",
    color: "#20C997",
    description: "Environmental concerns, pollution, tree issues",
    subcategories: [
      "Air Pollution",
      "Noise Pollution",
      "Tree Issues",
      "Environmental Damage",
    ],
  },
  {
    key: "other",
    label: "Other Issues",
    icon: "📝",
    color: "#8A8A8A",
    description: "Other community concerns not listed above",
    subcategories: ["General Inquiry", "Suggestion", "Complaint", "Other"],
  },
];

// Export workflow steps
export const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    status: "submitted",
    label: "Submitted",
    description: "Report has been submitted by resident",
    next_statuses: ["triaged"],
    required_role: ["resident", "guest"],
    auto_assign: false,
  },
  {
    status: "triaged",
    label: "Triaged",
    description: "Report has been reviewed and categorized",
    next_statuses: ["assigned", "closed"],
    required_role: ["operations_manager", "system_admin"],
    auto_assign: true,
  },
  {
    status: "assigned",
    label: "Assigned",
    description: "Report assigned to field coordinator",
    next_statuses: ["in_progress", "forwarded"],
    required_role: ["operations_manager", "field_coordinator"],
    auto_assign: false,
  },
  {
    status: "in_progress",
    label: "In Progress",
    description: "Field coordinator is working on the issue",
    next_statuses: ["forwarded", "resolved", "closed"],
    required_role: ["field_coordinator"],
    auto_assign: false,
  },
  {
    status: "forwarded",
    label: "Forwarded",
    description: "Sent to barangay official for action",
    next_statuses: ["resolved", "closed", "reopened"],
    required_role: ["field_coordinator"],
    auto_assign: false,
  },
  {
    status: "resolved",
    label: "Resolved",
    description: "Issue has been fixed/resolved",
    next_statuses: ["closed", "reopened"],
    required_role: ["field_coordinator", "operations_manager"],
    auto_assign: false,
  },
  {
    status: "closed",
    label: "Closed",
    description: "Report is closed and archived",
    next_statuses: ["reopened"],
    required_role: ["operations_manager"],
    auto_assign: false,
  },
  {
    status: "reopened",
    label: "Reopened",
    description: "Report has been reopened for follow-up",
    next_statuses: ["assigned", "in_progress", "resolved", "closed"],
    required_role: ["operations_manager", "field_coordinator"],
    auto_assign: true,
  },
];
