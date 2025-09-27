import { supabase } from "./supabase";

export interface AdminReport {
  id: string;
  title: string;
  description: string;
  category: string;
  urgency: string;
  status: string;
  barangay_code: string;
  barangay_name: string;
  specific_location: string;
  latitude: number;
  longitude: number;
  is_anonymous: boolean;
  reporter_contact?: string;
  photo_urls?: string[];
  user_id?: string;
  reporter_id?: string;
  created_at: string;
  updated_at: string;
  assigned_to?: string;
  assigned_admin?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
  admin_comments?: AdminComment[];
}

export interface AdminComment {
  id: string;
  comment: string;
  is_internal: boolean;
  created_at: string;
  admin: {
    first_name: string;
    last_name: string;
    role: string;
  };
}

export interface AdminStats {
  total_reports: number;
  pending_reports: number;
  in_progress_reports: number;
  resolved_reports: number;
  critical_reports: number;
  reports_by_category: { [key: string]: number };
  reports_by_barangay: { [key: string]: number };
  recent_reports: AdminReport[];
}

export interface ReportFilters {
  status?: string;
  category?: string;
  urgency?: string;
  barangay_code?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  assigned_to?: string;
}

class AdminService {
  // Dashboard Statistics
  async getDashboardStats(): Promise<{ data: AdminStats | null; error: any }> {
    try {
      // Get basic counts
      const { data: totalReports, error: totalError } = await supabase
        .from("reports")
        .select("id, status, category, urgency, barangay_code, created_at");

      if (totalError) throw totalError;

      const stats: AdminStats = {
        total_reports: totalReports?.length || 0,
        pending_reports:
          totalReports?.filter((r) => r.status === "submitted").length || 0,
        in_progress_reports:
          totalReports?.filter((r) => r.status === "in_progress").length || 0,
        resolved_reports:
          totalReports?.filter((r) => r.status === "resolved").length || 0,
        critical_reports:
          totalReports?.filter((r) => r.urgency === "critical").length || 0,
        reports_by_category: {},
        reports_by_barangay: {},
        recent_reports: [],
      };

      // Calculate category breakdown
      totalReports?.forEach((report) => {
        stats.reports_by_category[report.category] =
          (stats.reports_by_category[report.category] || 0) + 1;
        stats.reports_by_barangay[report.barangay_code] =
          (stats.reports_by_barangay[report.barangay_code] || 0) + 1;
      });

      // Get recent reports with details
      const { data: recentReports, error: recentError } = await supabase
        .from("reports_with_details")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);

      if (!recentError && recentReports) {
        stats.recent_reports = recentReports.map((report) => ({
          id: report.id,
          title: report.title,
          description: report.description,
          category: report.category,
          urgency: report.urgency,
          status: report.status,
          barangay_code: report.barangay_code,
          barangay_name: report.barangay_name,
          specific_location: report.specific_location,
          latitude: report.latitude,
          longitude: report.longitude,
          is_anonymous: report.is_anonymous,
          reporter_contact: report.reporter_contact,
          photo_urls: report.photo_urls,
          user_id: report.user_id,
          reporter_id: report.reporter_id,
          created_at: report.created_at,
          updated_at: report.updated_at,
        }));
      }

      return { data: stats, error: null };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      return { data: null, error };
    }
  }

  // Get all reports with filters
  async getReports(
    filters: ReportFilters = {}
  ): Promise<{ data: AdminReport[] | null; error: any }> {
    try {
      let query = supabase
        .from("reports_with_details")
        .select(
          `
          *,
          report_assignments!left(
            id,
            status,
            assigned_admin:admin_accounts!report_assignments_assigned_to_fkey(
              id,
              first_name,
              last_name,
              email
            )
          )
        `
        )
        .order("created_at", { ascending: false });

      // Apply filters
      if (filters.status) {
        query = query.eq("status", filters.status);
      }
      if (filters.category) {
        query = query.eq("category", filters.category);
      }
      if (filters.urgency) {
        query = query.eq("urgency", filters.urgency);
      }
      if (filters.barangay_code) {
        query = query.eq("barangay_code", filters.barangay_code);
      }
      if (filters.date_from) {
        query = query.gte("created_at", filters.date_from);
      }
      if (filters.date_to) {
        query = query.lte("created_at", filters.date_to);
      }
      if (filters.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;

      if (error) throw error;

      const reports: AdminReport[] = (data || []).map((report) => ({
        id: report.id,
        title: report.title,
        description: report.description,
        category: report.category,
        urgency: report.urgency,
        status: report.status,
        barangay_code: report.barangay_code,
        barangay_name: report.barangay_name,
        specific_location: report.specific_location,
        latitude: report.latitude,
        longitude: report.longitude,
        is_anonymous: report.is_anonymous,
        reporter_contact: report.reporter_contact,
        photo_urls: report.photo_urls,
        user_id: report.user_id,
        reporter_id: report.reporter_id,
        created_at: report.created_at,
        updated_at: report.updated_at,
        assigned_to: report.report_assignments?.[0]?.assigned_admin?.id,
        assigned_admin: report.report_assignments?.[0]?.assigned_admin,
      }));

      return { data: reports, error: null };
    } catch (error) {
      console.error("Error fetching reports:", error);
      return { data: null, error };
    }
  }

  // Get single report with full details
  async getReportById(
    id: string
  ): Promise<{ data: AdminReport | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("reports_with_details")
        .select(
          `
          *,
          report_assignments!left(
            id,
            status,
            notes,
            assigned_admin:admin_accounts!report_assignments_assigned_to_fkey(
              id,
              first_name,
              last_name,
              email
            )
          ),
          admin_comments!left(
            id,
            comment,
            is_internal,
            created_at,
            admin:admin_accounts!admin_comments_admin_id_fkey(
              first_name,
              last_name,
              role
            )
          )
        `
        )
        .eq("id", id)
        .single();

      if (error) throw error;

      const report: AdminReport = {
        id: data.id,
        title: data.title,
        description: data.description,
        category: data.category,
        urgency: data.urgency,
        status: data.status,
        barangay_code: data.barangay_code,
        barangay_name: data.barangay_name,
        specific_location: data.specific_location,
        latitude: data.latitude,
        longitude: data.longitude,
        is_anonymous: data.is_anonymous,
        reporter_contact: data.reporter_contact,
        photo_urls: data.photo_urls,
        user_id: data.user_id,
        reporter_id: data.reporter_id,
        created_at: data.created_at,
        updated_at: data.updated_at,
        assigned_to: data.report_assignments?.[0]?.assigned_admin?.id,
        assigned_admin: data.report_assignments?.[0]?.assigned_admin,
        admin_comments: data.admin_comments?.map((comment) => ({
          id: comment.id,
          comment: comment.comment,
          is_internal: comment.is_internal,
          created_at: comment.created_at,
          admin: comment.admin,
        })),
      };

      return { data: report, error: null };
    } catch (error) {
      console.error("Error fetching report:", error);
      return { data: null, error };
    }
  }

  // Update report status
  async updateReportStatus(
    reportId: string,
    status: string,
    notes?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from("reports")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", reportId);

      if (error) throw error;

      // Add admin comment if notes provided
      if (notes) {
        const { error: commentError } = await supabase
          .from("admin_comments")
          .insert({
            report_id: reportId,
            comment: notes,
            is_internal: false,
          });

        if (commentError) throw commentError;
      }

      return { success: true };
    } catch (error) {
      console.error("Error updating report status:", error);
      return { success: false, error: error.message };
    }
  }

  // Assign report to admin
  async assignReport(
    reportId: string,
    adminId: string,
    notes?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Remove existing assignments
      await supabase
        .from("report_assignments")
        .delete()
        .eq("report_id", reportId);

      // Create new assignment
      const { error } = await supabase.from("report_assignments").insert({
        report_id: reportId,
        assigned_to: adminId,
        notes,
      });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error("Error assigning report:", error);
      return { success: false, error: error.message };
    }
  }

  // Add admin comment
  async addComment(
    reportId: string,
    comment: string,
    isInternal: boolean = false
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.from("admin_comments").insert({
        report_id: reportId,
        comment,
        is_internal: isInternal,
      });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error("Error adding comment:", error);
      return { success: false, error: error.message };
    }
  }

  // Get all admins
  async getAdmins(): Promise<{ data: any[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("admin_accounts")
        .select(
          "id, email, first_name, last_name, role, barangay_code, is_active"
        )
        .eq("is_active", true)
        .order("first_name");

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error("Error fetching admins:", error);
      return { data: null, error };
    }
  }

  // Get barangays
  async getBarangays(): Promise<{ data: any[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("barangays")
        .select("*")
        .order("name");

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error("Error fetching barangays:", error);
      return { data: null, error };
    }
  }
}

export const adminService = new AdminService();
