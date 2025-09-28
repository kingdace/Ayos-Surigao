import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
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
        return "#3B82F6";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "roads_infrastructure":
        return "🛣️";
      case "utilities_power":
        return "⚡";
      case "water_sanitation":
        return "💧";
      case "waste_management":
        return "🗑️";
      case "public_safety":
        return "🚨";
      case "streetlights":
        return "💡";
      case "drainage_flooding":
        return "🌊";
      case "public_facilities":
        return "🏢";
      case "environmental":
        return "🌱";
      default:
        return "⚠️";
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
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
        <Text style={styles.greeting}>
          Welcome back,{" "}
          <Text style={styles.adminName}>
            {admin?.first_name} {admin?.last_name}
          </Text>
        </Text>
        <Text style={styles.welcomeSubtext}>
          Here's what's happening in your operations center
        </Text>
      </View>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.primaryStatCard]}>
            <Text style={styles.statIcon}>📊</Text>
            <Text style={styles.statNumber}>{stats?.total_reports || 0}</Text>
            <Text style={styles.statLabel}>Total Reports</Text>
          </View>
          <View style={[styles.statCard, styles.warningStatCard]}>
            <Text style={styles.statIcon}>⏳</Text>
            <Text style={styles.statNumber}>{stats?.pending_reports || 0}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={[styles.statCard, styles.accentStatCard]}>
            <Text style={styles.statIcon}>🔄</Text>
            <Text style={styles.statNumber}>
              {stats?.in_progress_reports || 0}
            </Text>
            <Text style={styles.statLabel}>In Progress</Text>
          </View>
          <View style={[styles.statCard, styles.successStatCard]}>
            <Text style={styles.statIcon}>✅</Text>
            <Text style={styles.statNumber}>
              {stats?.resolved_reports || 0}
            </Text>
            <Text style={styles.statLabel}>Resolved</Text>
          </View>
        </View>
      </View>

      {/* Critical Reports Alert - No Border */}
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
      <View style={styles.actionsSection}>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={onNavigateToReports}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.actionIconContainer,
                { backgroundColor: "#3B82F6" + "20" },
              ]}
            >
              <Text style={styles.actionIcon}>📋</Text>
            </View>
            <Text style={styles.actionTitle}>Manage Reports</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={onNavigateToMap}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.actionIconContainer,
                { backgroundColor: "#10B981" + "20" },
              ]}
            >
              <Text style={styles.actionIcon}>🗺️</Text>
            </View>
            <Text style={styles.actionTitle}>View Map</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Reports */}
      <View style={styles.reportsSection}>
        <View style={styles.reportsSectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Recent Reports</Text>
            <Text style={styles.sectionSubtitle}>Latest community issues</Text>
          </View>
          <TouchableOpacity onPress={onNavigateToReports}>
            <Text style={styles.seeAllText}>See All →</Text>
          </TouchableOpacity>
        </View>

        {stats?.recent_reports && stats.recent_reports.length > 0 ? (
          stats.recent_reports.slice(0, 5).map((report) => (
            <TouchableOpacity key={report.id} style={styles.reportCard}>
              <View style={styles.reportHeader}>
                <Text style={styles.reportTitle}>{report.title}</Text>
                <View
                  style={[
                    styles.urgencyBadge,
                    { backgroundColor: getUrgencyColor(report.urgency) },
                  ]}
                >
                  <Text style={styles.urgencyText}>
                    {report.urgency?.toUpperCase() || "MEDIUM"}
                  </Text>
                </View>
              </View>
              <View style={styles.reportMeta}>
                <Text style={styles.reportCategory}>
                  {getCategoryIcon(report.category)}{" "}
                  {report.category?.replace("_", " ").toUpperCase() || "OTHER"}
                </Text>
                <Text style={styles.reportLocation}>
                  📍 {report.barangay_name || "Unknown Location"}
                </Text>
                <Text style={styles.reportTime}>
                  🕒 {formatTimeAgo(report.created_at)}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No recent reports found</Text>
            <Text style={styles.emptyStateSubtext}>
              Reports will appear here as they are submitted
            </Text>
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
    paddingTop: 12,
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
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: Colors.background,
  },
  greeting: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  adminName: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  welcomeSubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    opacity: 0.8,
  },
  statsSection: {
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  statCard: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    width: (Dimensions.get("window").width - 60) / 4,
    marginBottom: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryStatCard: {
    borderTopWidth: 3,
    borderTopColor: Colors.primary,
  },
  successStatCard: {
    borderTopWidth: 3,
    borderTopColor: Colors.success,
  },
  warningStatCard: {
    borderTopWidth: 3,
    borderTopColor: Colors.warning,
  },
  accentStatCard: {
    borderTopWidth: 3,
    borderTopColor: Colors.tertiary,
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 6,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    textAlign: "center",
    fontWeight: "500",
  },
  alertCard: {
    flexDirection: "row",
    backgroundColor: "#FEF2F2",
    marginHorizontal: 20,
    marginVertical: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginTop: -16,
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
  actionsSection: {
    marginBottom: 24,
  },
  actionsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  actionCard: {
    width: (Dimensions.get("window").width - 50) / 2,
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  actionIcon: {
    fontSize: 24,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    textAlign: "center",
  },
  reportsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  reportsSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  seeAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "600",
  },
  reportCard: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  reportHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 12,
  },
  urgencyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  urgencyText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
  },
  reportMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  reportCategory: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  reportLocation: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  reportTime: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  emptyState: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
  },
});

export default AdminDashboardScreen;
