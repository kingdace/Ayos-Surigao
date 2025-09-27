import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Colors } from "../../constants/Colors";
import { useAuth } from "../../contexts/AuthContext";
import { SimpleOperationsService } from "../../lib/operations-service-simple";

const { width } = Dimensions.get("window");

interface HomeScreenProps {
  navigation?: any;
}

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [communityStats, setCommunityStats] = useState({
    totalReports: 0,
    resolvedReports: 0,
    activeReports: 0,
    yourReports: 0,
  });
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [userStats, setUserStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    resolvedReports: 0,
  });

  const operationsService = new SimpleOperationsService();

  useEffect(() => {
    loadDashboardData(); // Load data for both users and guests
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load community stats
      try {
        const stats = await operationsService.getDashboardStats();
        setCommunityStats({
          totalReports: stats?.total_reports || 0,
          resolvedReports: stats?.resolved_reports || 0,
          activeReports:
            (stats?.pending_reports || 0) + (stats?.in_progress_reports || 0),
          yourReports: 0, // Will be updated below
        });
      } catch (error) {
        console.error("Error loading stats:", error);
        // Set default values on error
        setCommunityStats({
          totalReports: 0,
          resolvedReports: 0,
          activeReports: 0,
          yourReports: 0,
        });
      }

      // Load user stats only if user is logged in
      if (user) {
        const { data: userStatsData, error: userStatsError } =
          await operationsService.getUserStats();
        if (userStatsError) {
          console.error("Error loading user stats:", userStatsError);
          // Set default values on error
          setUserStats({
            totalReports: 0,
            pendingReports: 0,
            resolvedReports: 0,
          });
        } else {
          setUserStats(
            userStatsData || {
              totalReports: 0,
              pendingReports: 0,
              resolvedReports: 0,
            }
          );
          setCommunityStats((prev) => ({
            ...prev,
            yourReports: userStatsData?.totalReports || 0,
          }));
        }
      } else {
        // Guest user - set default user stats
        setUserStats({
          totalReports: 0,
          pendingReports: 0,
          resolvedReports: 0,
        });
        setCommunityStats((prev) => ({
          ...prev,
          yourReports: 0, // Guests can't have personal reports
        }));
      }

      // Load recent reports
      const { data: reports, error: reportsError } =
        await operationsService.getReports({ limit: 5 });
      if (reportsError) {
        console.error("Error loading recent reports:", reportsError);
      } else {
        setRecentReports(reports || []);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (actionId: number) => {
    if (!navigation) return;

    switch (actionId) {
      case 1: // Report Issue
        navigation.navigate("create");
        break;
      case 2: // View Map
        navigation.navigate("map");
        break;
      case 3: // My Reports (logged-in users only)
        if (user) {
          navigation.navigate("reports", { activeTab: "my" });
        }
        break;
      case 4: // Browse All
        navigation.navigate("reports", { activeTab: "all" });
        break;
      case 5: // Create Account (guests only)
        if (!user) {
          navigation.navigate("signup");
        }
        break;
      default:
        break;
    }
  };

  const quickActions = user
    ? [
        { id: 1, title: "Report Issue", icon: "📝", color: Colors.primary },
        { id: 2, title: "View Map", icon: "🗺️", color: Colors.secondary },
        { id: 3, title: "My Reports", icon: "📋", color: Colors.tertiary },
        { id: 4, title: "Browse All", icon: "🔍", color: Colors.accent },
      ]
    : [
        { id: 1, title: "Report Issue", icon: "📝", color: Colors.primary },
        { id: 2, title: "View Map", icon: "🗺️", color: Colors.secondary },
        { id: 4, title: "Browse All", icon: "🔍", color: Colors.accent },
        { id: 5, title: "Create Account", icon: "👤", color: Colors.tertiary },
      ];

  // Ensure quickActions is always an array
  const safeQuickActions = Array.isArray(quickActions) ? quickActions : [];

  const getUrgencyColor = (urgency: string) => {
    switch (urgency?.toLowerCase()) {
      case "critical":
        return "#EF4444"; // Red
      case "high":
        return "#F97316"; // Orange
      case "medium":
        return "#F59E0B"; // Yellow
      case "low":
        return "#10B981"; // Green
      default:
        return "#6B7280"; // Gray for unknown
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "infrastructure":
        return "🏗️";
      case "utilities":
        return "🔌";
      case "roads":
        return "🛣️";
      case "cleanliness":
        return "🗑️";
      case "safety":
        return "🚨";
      case "environment":
        return "🌱";
      case "other":
        return "📋";
      default:
        return "📋";
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const reportDate = new Date(dateString);
    const diffInHours = Math.floor(
      (now.getTime() - reportDate.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return reportDate.toLocaleDateString();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF9B00" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Community Stats - Compact Grid */}
      <View style={styles.statsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Community Impact</Text>
          <Text style={styles.sectionSubtitle}>Real-time community data</Text>
        </View>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, styles.primaryStatCard]}>
            <Text style={styles.statIcon}>📊</Text>
            <Text style={styles.statNumber}>{communityStats.totalReports}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={[styles.statCard, styles.successStatCard]}>
            <Text style={styles.statIcon}>✅</Text>
            <Text style={styles.statNumber}>
              {communityStats.resolvedReports}
            </Text>
            <Text style={styles.statLabel}>Resolved</Text>
          </View>
          <View style={[styles.statCard, styles.warningStatCard]}>
            <Text style={styles.statIcon}>⏳</Text>
            <Text style={styles.statNumber}>
              {communityStats.activeReports}
            </Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          {user && (
            <View style={[styles.statCard, styles.accentStatCard]}>
              <Text style={styles.statIcon}>👤</Text>
              <Text style={styles.statNumber}>
                {communityStats.yourReports}
              </Text>
              <Text style={styles.statLabel}>Yours</Text>
            </View>
          )}
        </View>
      </View>

      {/* Quick Actions - Enhanced Layout */}
      <View style={styles.actionsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <Text style={styles.sectionSubtitle}>What would you like to do?</Text>
        </View>
        <View style={styles.actionsGrid}>
          {safeQuickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={styles.actionCard}
              activeOpacity={0.7}
              onPress={() => handleQuickAction(action.id)}
            >
              <View
                style={[
                  styles.actionIconContainer,
                  { backgroundColor: `${action.color}15` },
                ]}
              >
                <Text style={styles.actionIcon}>{action.icon}</Text>
              </View>
              <Text style={styles.actionTitle}>{action.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Reports */}
      <View style={styles.reportsSection}>
        <View style={styles.reportsSectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Recent Reports</Text>
            <Text style={styles.sectionSubtitle}>Latest community issues</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All →</Text>
          </TouchableOpacity>
        </View>

        {recentReports && recentReports.length > 0 ? (
          recentReports.map((report) => (
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
              Be the first to report an issue in your community!
            </Text>
          </View>
        )}
      </View>

      {/* Bottom Padding for floating navigation */}
      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
    paddingTop: 12,
  },
  // Enhanced Section Headers
  sectionHeader: {
    alignItems: "center",
    marginBottom: 16,
    paddingHorizontal: 20,
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
    textAlign: "center",
  },
  // Compact Stats Section - Grid Layout
  statsSection: {
    marginBottom: 24,
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
    width: (width - 60) / 4, // 4 cards per row with proper spacing
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
  // Enhanced Actions Section
  actionsSection: {
    marginBottom: 24,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  actionCard: {
    width: (width - 50) / 2,
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
  // Enhanced Reports Section
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
  bottomPadding: {
    height: 90,
  },
  // Loading and Empty States
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

export default HomeScreen;
