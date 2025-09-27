import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { Colors } from "../../constants/Colors";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import { adminService, AdminStats, AdminReport } from "../../lib/admin-service";

interface AdminDashboardScreenProps {
  onNavigateToReports: () => void;
  onNavigateToMap: () => void;
  onNavigateToProfile: () => void;
}

const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({
  onNavigateToReports,
  onNavigateToMap,
  onNavigateToProfile,
}) => {
  const { admin } = useAdminAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data, error } = await adminService.getDashboardStats();
      if (error) {
        console.error("Error loading dashboard data:", error);
      } else {
        setStats(data);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "#F59E0B";
      case "in_progress":
        return "#3B82F6";
      case "resolved":
        return "#10B981";
      case "rejected":
        return "#EF4444";
      default:
        return Colors.textSecondary;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return "#EF4444";
      case "high":
        return "#F59E0B";
      case "medium":
        return "#3B82F6";
      case "low":
        return "#10B981";
      default:
        return Colors.textSecondary;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.greeting}>Welcome back,</Text>

        <Text style={styles.welcomeSubtext}>
          Here's what's happening in your operations center
        </Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats?.total_reports || 0}</Text>
          <Text style={styles.statLabel}>Total Reports</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: "#F59E0B" }]}>
            {stats?.pending_reports || 0}
          </Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: "#3B82F6" }]}>
            {stats?.in_progress_reports || 0}
          </Text>
          <Text style={styles.statLabel}>In Progress</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: "#10B981" }]}>
            {stats?.resolved_reports || 0}
          </Text>
          <Text style={styles.statLabel}>Resolved</Text>
        </View>
      </View>

      {/* Critical Reports Alert */}
      {stats?.critical_reports && stats.critical_reports > 0 && (
        <View style={styles.alertCard}>
          <Text style={styles.alertIcon}>⚠️</Text>
          <View style={styles.alertContent}>
            <Text style={styles.alertTitle}>Critical Reports Alert</Text>
            <Text style={styles.alertText}>
              {stats.critical_reports} critical reports require immediate
              attention
            </Text>
          </View>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={onNavigateToReports}
          >
            <Text style={styles.quickActionIcon}>📋</Text>
            <Text style={styles.quickActionText}>Manage Reports</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={onNavigateToMap}
          >
            <Text style={styles.quickActionIcon}>🗺️</Text>
            <Text style={styles.quickActionText}>View Map</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Reports */}
      <View style={styles.recentReportsContainer}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Reports</Text>
          <TouchableOpacity onPress={onNavigateToReports}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {stats?.recent_reports && stats.recent_reports.length > 0 ? (
          <View style={styles.recentReportsList}>
            {stats.recent_reports.slice(0, 5).map((report) => (
              <View key={report.id} style={styles.recentReportCard}>
                <View style={styles.reportHeader}>
                  <Text style={styles.reportTitle} numberOfLines={1}>
                    {report.title}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(report.status) + "20" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(report.status) },
                      ]}
                    >
                      {report.status.replace("_", " ").toUpperCase()}
                    </Text>
                  </View>
                </View>
                <Text style={styles.reportDescription} numberOfLines={2}>
                  {report.description}
                </Text>
                <View style={styles.reportFooter}>
                  <Text style={styles.reportCategory}>{report.category}</Text>
                  <View
                    style={[
                      styles.urgencyBadge,
                      {
                        backgroundColor: getUrgencyColor(report.urgency) + "20",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.urgencyText,
                        { color: getUrgencyColor(report.urgency) },
                      ]}
                    >
                      {report.urgency.toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No recent reports</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.backgroundLight,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: Colors.background,
  },
  greeting: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  adminName: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginTop: 2,
  },
  welcomeSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
    opacity: 0.8,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  alertCard: {
    flexDirection: "row",
    backgroundColor: "#FEF2F2",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#EF4444",
  },
  alertIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#DC2626",
    marginBottom: 4,
  },
  alertText: {
    fontSize: 14,
    color: "#991B1B",
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickActionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    textAlign: "center",
  },
  recentReportsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "600",
  },
  recentReportsList: {
    gap: 12,
  },
  recentReportCard: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
  },
  reportDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  reportFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reportCategory: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  urgencyText: {
    fontSize: 10,
    fontWeight: "600",
  },
  emptyState: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 40,
    alignItems: "center",
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
});

export default AdminDashboardScreen;
