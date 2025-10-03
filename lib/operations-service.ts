// Fix My Barangay - Operations Center Service Layer
// Centralized service for all operations center functionality

import { supabase } from "./supabase";
import {
  Report,
  ReportAttachment,
  CreateReportData,
  UpdateReportData,
  ReportFilters,
  PaginationParams,
  ApiResponse,
  UserProfile,
  OperationsStaff,
  ReportStatusHistory,
  ReportComment,
  SystemNotification,
  DashboardStats,
  AnalyticsSummary,
  BarangayOfficial,
  ReportStatus,
  UrgencyLevel,
  ReportCategory,
} from "../types/centralized-system";

export class OperationsCenterService {
  // ===== REPORT MANAGEMENT =====

  /**
   * Create a new report
   */
  async createReport(
    reportData: CreateReportData,
    attachments?: File[]
  ): Promise<ApiResponse<Report>> {
    try {
      // Insert report
      const { data: report, error: reportError } = await supabase
        .from("reports")
        .insert({
          title: reportData.title,
          description: reportData.description,
          category: reportData.category,
          subcategory: reportData.subcategory,
          urgency: reportData.urgency,
          specific_location: reportData.specific_location,
          latitude: reportData.latitude,
          longitude: reportData.longitude,
          is_anonymous: reportData.is_anonymous || false,
          reporter_id: reportData.is_anonymous
            ? null
            : (
                await supabase.auth.getUser()
              ).data.user?.id,
          barangay_code: "POBLACION", // Will be set based on user profile or location
          barangay_name: "Poblacion",
        })
        .select("*")
        .single();

      if (reportError) throw reportError;

      // Upload attachments if provided
      if (attachments && attachments.length > 0) {
        await this.uploadReportAttachments(report.id, attachments);
      }

      // Trigger auto-assignment workflow
      await this.triggerAutoAssignment(report.id);

      return {
        data: report,
        success: true,
        message: "Report created successfully",
      };
    } catch (error) {
      console.error("Error creating report:", error);
      return {
        data: {} as Report,
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to create report",
      };
    }
  }

  /**
   * Get reports with filtering and pagination
   */
  async getReports(
    filters: ReportFilters = {},
    pagination: PaginationParams = {}
  ): Promise<ApiResponse<Report[]>> {
    try {
      let query = supabase.from("reports_with_details").select("*");

      // Apply filters
      if (filters.status && filters.status.length > 0) {
        query = query.in("status", filters.status);
      }

      if (filters.category && filters.category.length > 0) {
        query = query.in("category", filters.category);
      }

      if (filters.urgency && filters.urgency.length > 0) {
        query = query.in("urgency", filters.urgency);
      }

      if (filters.barangay_code && filters.barangay_code.length > 0) {
        query = query.in("barangay_code", filters.barangay_code);
      }

      if (filters.assigned_to && filters.assigned_to.length > 0) {
        query = query.in("assigned_to", filters.assigned_to);
      }

      if (filters.date_from) {
        query = query.gte("created_at", filters.date_from);
      }

      if (filters.date_to) {
        query = query.lte("created_at", filters.date_to);
      }

      if (filters.search_query) {
        query = query.or(
          `title.ilike.%${filters.search_query}%,description.ilike.%${filters.search_query}%`
        );
      }

      // Apply sorting
      const sortBy = pagination.sort_by || "created_at";
      const sortOrder = pagination.sort_order || "desc";
      query = query.order(sortBy, { ascending: sortOrder === "asc" });

      // Apply pagination
      const page = pagination.page || 1;
      const limit = pagination.limit || 20;
      const offset = (page - 1) * limit;

      query = query.range(offset, offset + limit - 1);

      const { data: reports, error, count } = await query;

      if (error) throw error;

      return {
        data: reports || [],
        success: true,
        pagination: {
          total: count || 0,
          page,
          limit,
          total_pages: Math.ceil((count || 0) / limit),
        },
      };
    } catch (error) {
      console.error("Error fetching reports:", error);
      return {
        data: [],
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to fetch reports",
      };
    }
  }

  /**
   * Get a single report by ID with full details
   */
  async getReportById(reportId: string): Promise<ApiResponse<Report>> {
    try {
      const { data: report, error } = await supabase
        .from("reports_with_details")
        .select("*")
        .eq("id", reportId)
        .single();

      if (error) throw error;

      // Get attachments
      const { data: attachments } = await supabase
        .from("report_attachments")
        .select("*")
        .eq("report_id", reportId);

      // Get status history
      const { data: statusHistory } = await supabase
        .from("report_status_history")
        .select("*, changed_by_user:profiles!changed_by(*)")
        .eq("report_id", reportId)
        .order("created_at", { ascending: false });

      // Get comments
      const { data: comments } = await supabase
        .from("report_comments")
        .select("*, user:profiles!user_id(*)")
        .eq("report_id", reportId)
        .order("created_at", { ascending: true });

      // Increment view count
      await supabase
        .from("reports")
        .update({ views_count: (report.views_count || 0) + 1 })
        .eq("id", reportId);

      const fullReport: Report = {
        ...report,
        attachments: attachments || [],
        status_history: statusHistory || [],
        comments: comments || [],
      };

      return {
        data: fullReport,
        success: true,
      };
    } catch (error) {
      console.error("Error fetching report:", error);
      return {
        data: {} as Report,
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to fetch report",
      };
    }
  }

  /**
   * Update a report (for operations center staff)
   */
  async updateReport(
    reportId: string,
    updateData: UpdateReportData
  ): Promise<ApiResponse<Report>> {
    try {
      const { data: report, error } = await supabase
        .from("reports")
        .update(updateData)
        .eq("id", reportId)
        .select("*")
        .single();

      if (error) throw error;

      // Add internal comment if provided
      if (updateData.internal_notes) {
        await this.addReportComment(
          reportId,
          updateData.internal_notes,
          true,
          true
        );
      }

      // Send notifications for status changes
      if (updateData.status) {
        await this.sendStatusChangeNotification(reportId, updateData.status);
      }

      return {
        data: report,
        success: true,
        message: "Report updated successfully",
      };
    } catch (error) {
      console.error("Error updating report:", error);
      return {
        data: {} as Report,
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to update report",
      };
    }
  }

  /**
   * Assign report to staff member
   */
  async assignReport(
    reportId: string,
    staffId: string
  ): Promise<ApiResponse<Report>> {
    try {
      const { data: report, error } = await supabase
        .from("reports")
        .update({
          assigned_to: staffId,
          assigned_at: new Date().toISOString(),
          status: "assigned",
        })
        .eq("id", reportId)
        .select("*")
        .single();

      if (error) throw error;

      // Send assignment notification
      await this.sendAssignmentNotification(reportId, staffId);

      return {
        data: report,
        success: true,
        message: "Report assigned successfully",
      };
    } catch (error) {
      console.error("Error assigning report:", error);
      return {
        data: {} as Report,
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to assign report",
      };
    }
  }

  // ===== ATTACHMENT MANAGEMENT =====

  /**
   * Upload attachments for a report
   */
  async uploadReportAttachments(
    reportId: string,
    files: File[]
  ): Promise<ReportAttachment[]> {
    const attachments: ReportAttachment[] = [];

    for (const file of files) {
      try {
        // Upload file to storage
        const fileName = `${reportId}/${Date.now()}_${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("report-attachments")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("report-attachments").getPublicUrl(fileName);

        // Save attachment record
        const { data: attachment, error: dbError } = await supabase
          .from("report_attachments")
          .insert({
            report_id: reportId,
            file_url: publicUrl,
            file_type: file.type.startsWith("image/") ? "image" : "document",
            file_size: file.size,
            is_before_photo: true,
          })
          .select("*")
          .single();

        if (dbError) throw dbError;

        attachments.push(attachment);
      } catch (error) {
        console.error("Error uploading attachment:", error);
      }
    }

    return attachments;
  }

  // ===== COMMENT MANAGEMENT =====

  /**
   * Add comment to a report
   */
  async addReportComment(
    reportId: string,
    comment: string,
    isInternal: boolean = false,
    isOfficialUpdate: boolean = false
  ): Promise<ApiResponse<ReportComment>> {
    try {
      const { data: user } = await supabase.auth.getUser();

      const { data: newComment, error } = await supabase
        .from("report_comments")
        .insert({
          report_id: reportId,
          user_id: user.user?.id,
          comment,
          is_internal: isInternal,
          is_official_update: isOfficialUpdate,
        })
        .select("*, user:profiles!user_id(*)")
        .single();

      if (error) throw error;

      return {
        data: newComment,
        success: true,
        message: "Comment added successfully",
      };
    } catch (error) {
      console.error("Error adding comment:", error);
      return {
        data: {} as ReportComment,
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to add comment",
      };
    }
  }

  // ===== DASHBOARD & ANALYTICS =====

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    try {
      // Get basic counts (excluding soft-deleted reports)
      const { data: allReports } = await supabase
        .from("reports")
        .select("status, category, barangay_code, created_at, resolved_at")
        .eq("deleted", false);

      if (!allReports) throw new Error("Failed to fetch reports");

      const today = new Date().toDateString();
      const todayReports = allReports.filter(
        (r) => new Date(r.created_at).toDateString() === today
      );

      const stats: DashboardStats = {
        total_reports: allReports.length,
        pending_reports: allReports.filter((r) =>
          ["submitted", "triaged", "assigned"].includes(r.status)
        ).length,
        in_progress_reports: allReports.filter((r) =>
          ["in_progress", "forwarded"].includes(r.status)
        ).length,
        resolved_reports: allReports.filter((r) => r.status === "resolved")
          .length,
        emergency_reports: allReports.filter(
          (r) => r.status !== "closed" && r.status !== "resolved"
        ).length,
        today_reports: todayReports.length,
        resolution_rate:
          allReports.length > 0
            ? (allReports.filter((r) => r.status === "resolved").length /
                allReports.length) *
              100
            : 0,
        average_resolution_time:
          this.calculateAverageResolutionTime(allReports),
        most_reported_category: this.getMostReportedCategory(allReports),
        most_active_barangay: this.getMostActiveBarangay(allReports),
        staff_performance: [], // Will be implemented later
      };

      return {
        data: stats,
        success: true,
      };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      return {
        data: {} as DashboardStats,
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch dashboard stats",
      };
    }
  }

  // ===== STAFF MANAGEMENT =====

  /**
   * Get operations staff
   */
  async getOperationsStaff(): Promise<ApiResponse<OperationsStaff[]>> {
    try {
      const { data: staff, error } = await supabase.from("operations_staff")
        .select(`
          *,
          profile:profiles!user_id(*),
          supervisor:operations_staff!supervisor_id(*)
        `);

      if (error) throw error;

      return {
        data: staff || [],
        success: true,
      };
    } catch (error) {
      console.error("Error fetching operations staff:", error);
      return {
        data: [],
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch operations staff",
      };
    }
  }

  // ===== NOTIFICATION SYSTEM =====

  /**
   * Send assignment notification
   */
  private async sendAssignmentNotification(
    reportId: string,
    staffId: string
  ): Promise<void> {
    try {
      const { data: staff } = await supabase
        .from("operations_staff")
        .select("user_id")
        .eq("id", staffId)
        .single();

      if (staff) {
        await supabase.from("system_notifications").insert({
          recipient_id: staff.user_id,
          title: "New Report Assigned",
          message: "A new report has been assigned to you",
          type: "report_assigned",
          related_report_id: reportId,
          priority: "medium",
        });
      }
    } catch (error) {
      console.error("Error sending assignment notification:", error);
    }
  }

  /**
   * Send status change notification
   */
  private async sendStatusChangeNotification(
    reportId: string,
    newStatus: ReportStatus
  ): Promise<void> {
    try {
      const { data: report } = await supabase
        .from("reports")
        .select("reporter_id, title")
        .eq("id", reportId)
        .single();

      if (report && report.reporter_id) {
        await supabase.from("system_notifications").insert({
          recipient_id: report.reporter_id,
          title: "Report Status Updated",
          message: `Your report "${report.title}" status has been updated to ${newStatus}`,
          type: "status_update",
          related_report_id: reportId,
          priority: "medium",
        });
      }
    } catch (error) {
      console.error("Error sending status change notification:", error);
    }
  }

  // ===== AUTO-ASSIGNMENT LOGIC =====

  /**
   * Trigger auto-assignment workflow
   */
  private async triggerAutoAssignment(reportId: string): Promise<void> {
    try {
      // Get available field coordinators
      const { data: coordinators } = await supabase
        .from("operations_staff")
        .select("*")
        .eq("department", "field")
        .eq("is_on_duty", true);

      if (coordinators && coordinators.length > 0) {
        // Simple round-robin assignment for now
        const randomCoordinator =
          coordinators[Math.floor(Math.random() * coordinators.length)];

        await supabase
          .from("reports")
          .update({
            status: "triaged",
            triaged_at: new Date().toISOString(),
          })
          .eq("id", reportId);
      }
    } catch (error) {
      console.error("Error in auto-assignment:", error);
    }
  }

  // ===== UTILITY METHODS =====

  private calculateAverageResolutionTime(reports: any[]): number {
    const resolvedReports = reports.filter((r) => r.resolved_at);
    if (resolvedReports.length === 0) return 0;

    const totalTime = resolvedReports.reduce((sum, report) => {
      const created = new Date(report.created_at).getTime();
      const resolved = new Date(report.resolved_at).getTime();
      return sum + (resolved - created);
    }, 0);

    return Math.round(
      totalTime / resolvedReports.length / (1000 * 60 * 60 * 24)
    ); // days
  }

  private getMostReportedCategory(reports: any[]): ReportCategory {
    const categoryCounts: Record<string, number> = {};
    reports.forEach((report) => {
      categoryCounts[report.category] =
        (categoryCounts[report.category] || 0) + 1;
    });

    const mostReported = Object.entries(categoryCounts).sort(
      ([, a], [, b]) => b - a
    )[0];

    return (mostReported?.[0] as ReportCategory) || "other";
  }

  private getMostActiveBarangay(reports: any[]): string {
    const barangayCounts: Record<string, number> = {};
    reports.forEach((report) => {
      barangayCounts[report.barangay_code] =
        (barangayCounts[report.barangay_code] || 0) + 1;
    });

    const mostActive = Object.entries(barangayCounts).sort(
      ([, a], [, b]) => b - a
    )[0];

    return mostActive?.[0] || "POBLACION";
  }
}

// Export singleton instance
export const operationsService = new OperationsCenterService();
