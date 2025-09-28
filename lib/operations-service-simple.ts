// Fix My Barangay - Simple Operations Service
// Works with your actual database structure

import { supabase } from "./supabase";

export interface SimpleReportData {
  title: string;
  description: string;
  category: string;
  urgency?: string;
  barangay_code?: string;
  barangay_name?: string;
  specific_location: string;
  latitude?: number;
  longitude?: number;
  is_anonymous?: boolean;
  reporter_contact?: string;
  photo_urls?: string[];
}

export interface SimpleReport {
  id: string;
  report_number: string;
  title: string;
  description: string;
  category: string;
  status: string;
  urgency?: string;
  barangay_code?: string;
  barangay_name?: string;
  specific_location: string;
  latitude?: number;
  longitude?: number;
  is_anonymous: boolean;
  created_at: string;
  user_id?: string;
  photo_urls?: string[];
  reporter_name?: string;
  reporter_avatar?: string;
}

export class SimpleOperationsService {
  /**
   * Create a new report
   */
  async createReport(
    reportData: SimpleReportData
  ): Promise<{ data: SimpleReport | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("reports")
        .insert({
          title: reportData.title,
          description: reportData.description,
          category: reportData.category,
          urgency: reportData.urgency || "medium",
          barangay_code: reportData.barangay_code,
          barangay_name: reportData.barangay_name,
          specific_location: reportData.specific_location,
          latitude: reportData.latitude,
          longitude: reportData.longitude,
          is_anonymous: reportData.is_anonymous || false,
          reporter_contact: reportData.reporter_contact,
          photo_urls: reportData.photo_urls,
          user_id: reportData.is_anonymous
            ? null
            : (
                await supabase.auth.getUser()
              ).data.user?.id,
          reporter_id: reportData.is_anonymous
            ? null
            : (
                await supabase.auth.getUser()
              ).data.user?.id,
          status: "submitted",
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error("Error creating report:", error);
      return { data: null, error };
    }
  }

  /**
   * Upload images to Supabase Storage
   */
  async uploadImages(
    images: { uri: string; fileName?: string }[]
  ): Promise<{ urls: string[]; error: any }> {
    try {
      const urls: string[] = [];

      // Get current user for organizing files
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const userId = user?.id || "anonymous";

      for (const image of images) {
        // Create unique filename with user organization
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const additionalRandom = Math.random().toString(36).substring(2, 8);
        const fileName =
          image.fileName ||
          `image_${timestamp}_${randomString}_${additionalRandom}.jpg`;
        const filePath = `reports/${userId}/${fileName}`;

        console.log(`Uploading image to: ${filePath}`);

        // Fetch the image data
        const response = await fetch(image.uri);

        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.statusText}`);
        }

        const imageArrayBuffer = await response.arrayBuffer();

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from("report-images")
          .upload(filePath, imageArrayBuffer, {
            contentType: "image/jpeg",
            cacheControl: "3600",
            upsert: true, // Allow overwriting for guest users
          });

        if (error) {
          console.error("Error uploading image:", error);
          throw error;
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from("report-images")
          .getPublicUrl(filePath);

        if (!publicUrlData.publicUrl) {
          throw new Error("Failed to get public URL for uploaded image");
        }

        urls.push(publicUrlData.publicUrl);
        console.log(`Successfully uploaded image: ${publicUrlData.publicUrl}`);
      }

      console.log(
        `Successfully uploaded ${images.length} image(s) to Supabase Storage`
      );
      return { urls, error: null };
    } catch (error) {
      console.error("Error uploading images:", error);
      return { urls: [], error };
    }
  }

  /**
   * Get reports with basic filtering
   */
  async getReports(
    filters: {
      status?: string;
      category?: string;
      barangay_code?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<{ data: SimpleReport[] | null; error: any }> {
    try {
      let query = supabase
        .from("reports_with_details")
        .select("*")
        .eq("deleted", false) // Exclude deleted reports
        .order("created_at", { ascending: false });

      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      if (filters.category) {
        query = query.eq("category", filters.category);
      }

      if (filters.barangay_code) {
        query = query.eq("barangay_code", filters.barangay_code);
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      if (filters.offset) {
        query = query.range(
          filters.offset,
          filters.offset + (filters.limit || 10) - 1
        );
      }

      const { data, error } = await query;
      return { data, error };
    } catch (error) {
      console.error("Error fetching reports:", error);
      return { data: null, error };
    }
  }

  /**
   * Get report by ID
   */
  async getReportById(
    id: string
  ): Promise<{ data: SimpleReport | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .eq("id", id)
        .eq("deleted", false) // Exclude deleted reports
        .single();

      return { data, error };
    } catch (error) {
      console.error("Error fetching report:", error);
      return { data: null, error };
    }
  }

  /**
   * Update report status (for operations staff)
   */
  async updateReportStatus(
    reportId: string,
    status: string,
    notes?: string
  ): Promise<{ data: SimpleReport | null; error: any }> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === "resolved") {
        updateData.resolved_at = new Date().toISOString();
        updateData.resolved_by = (await supabase.auth.getUser()).data.user?.id;
      }

      if (notes) {
        updateData.admin_notes = notes;
      }

      const { data, error } = await supabase
        .from("reports")
        .update(updateData)
        .eq("id", reportId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error("Error updating report status:", error);
      return { data: null, error };
    }
  }

  /**
   * Get basic dashboard stats
   */
  async getDashboardStats(): Promise<{
    total_reports: number;
    pending_reports: number;
    in_progress_reports: number;
    resolved_reports: number;
  }> {
    try {
      const { data: reports, error } = await supabase
        .from("reports")
        .select("status");

      if (error || !reports) {
        return {
          total_reports: 0,
          pending_reports: 0,
          in_progress_reports: 0,
          resolved_reports: 0,
        };
      }

      const stats = {
        total_reports: reports.length,
        pending_reports: reports.filter((r) =>
          ["pending", "submitted"].includes(r.status)
        ).length,
        in_progress_reports: reports.filter((r) =>
          ["in_progress", "assigned", "reviewing"].includes(r.status)
        ).length,
        resolved_reports: reports.filter((r) =>
          ["resolved", "verified", "closed"].includes(r.status)
        ).length,
      };

      return stats;
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      return {
        total_reports: 0,
        pending_reports: 0,
        in_progress_reports: 0,
        resolved_reports: 0,
      };
    }
  }

  /**
   * Get all barangays
   */
  async getBarangays(): Promise<{ data: any[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from("barangays")
        .select("*")
        .order("name");

      return { data, error };
    } catch (error) {
      console.error("Error fetching barangays:", error);
      return { data: null, error };
    }
  }

  /**
   * Get user profile information
   */
  async getUserProfile(): Promise<{ data: any; error: any }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return { data: null, error: "No user found" };
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      return { data, error };
    } catch (error) {
      console.error("Error getting user profile:", error);
      return { data: null, error };
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<{ data: any; error: any }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return { data: null, error: "No user found" };
      }

      const { data: reports, error } = await supabase
        .from("reports")
        .select("status")
        .eq("user_id", user.id);

      if (error || !reports) {
        return {
          data: {
            totalReports: 0,
            pendingReports: 0,
            resolvedReports: 0,
          },
          error,
        };
      }

      const stats = {
        totalReports: reports.length,
        pendingReports: reports.filter((r) =>
          [
            "pending",
            "submitted",
            "in_progress",
            "assigned",
            "reviewing",
          ].includes(r.status)
        ).length,
        resolvedReports: reports.filter((r) =>
          ["resolved", "verified", "closed"].includes(r.status)
        ).length,
      };

      return { data: stats, error: null };
    } catch (error) {
      console.error("Error getting user stats:", error);
      return {
        data: {
          totalReports: 0,
          pendingReports: 0,
          resolvedReports: 0,
        },
        error,
      };
    }
  }
}

// Export a singleton instance
export const simpleOperationsService = new SimpleOperationsService();
