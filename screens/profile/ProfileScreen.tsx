import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  Dimensions,
} from "react-native";
import { Colors } from "../../constants/Colors";
import { useAuth } from "../../contexts/AuthContext";
import { SimpleOperationsService } from "../../lib/operations-service-simple";

const { width } = Dimensions.get("window");

interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  barangay_name?: string;
  barangay_code?: string;
  role?: string;
  created_at: string;
  avatar_url?: string;
}

const ProfileScreen = () => {
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    resolvedReports: 0,
  });

  const operationsService = new SimpleOperationsService();

  useEffect(() => {
    if (user) {
      loadUserProfile();
      loadUserStats();
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await operationsService.getUserProfile();

      if (error) {
        console.error("Error loading profile:", error);
        return;
      }

      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      const { data, error } = await operationsService.getUserStats();

      if (error) {
        console.error("Error loading stats:", error);
        return;
      }

      if (data) {
        setStats(data);
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
            console.log("User logged out successfully");
          } catch (error) {
            console.error("Error during logout:", error);
            Alert.alert("Error", "Failed to logout. Please try again.");
          }
        },
      },
    ]);
  };

  const getRoleDisplayName = (role?: string) => {
    if (!role) return "Resident";

    switch (role) {
      case "resident":
        return "Resident";
      case "guest":
        return "Guest";
      case "operations_manager":
        return "Operations Manager";
      case "system_admin":
        return "System Administrator";
      case "field_coordinator":
        return "Field Coordinator";
      case "data_analyst":
        return "Data Analyst";
      case "super_admin":
        return "Super Administrator";
      case "barangay_admin":
        return "Barangay Administrator";
      default:
        return "Resident";
    }
  };

  const getRoleColor = (role?: string) => {
    if (!role) return "#6B7280";

    switch (role) {
      case "resident":
        return "#3B82F6";
      case "guest":
        return "#6B7280";
      case "operations_manager":
        return "#8B5CF6";
      case "system_admin":
        return "#DC2626";
      case "field_coordinator":
        return "#059669";
      case "data_analyst":
        return "#F59E0B";
      case "super_admin":
        return "#B91C1C";
      case "barangay_admin":
        return "#7C3AED";
      default:
        return "#6B7280";
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {profile?.first_name?.[0] || profile?.email?.[0] || "U"}
            </Text>
          </View>
        </View>

        <View style={styles.profileInfo}>
          <Text style={styles.userName}>
            {profile?.first_name && profile?.last_name
              ? `${profile.first_name} ${profile.last_name}`
              : profile?.email || "User"}
          </Text>

          <Text style={styles.userEmail}>{profile?.email}</Text>

          {profile?.barangay_name && (
            <View style={styles.locationContainer}>
              <Text style={styles.locationIcon}>📍</Text>
              <Text style={styles.locationText}>{profile.barangay_name}</Text>
            </View>
          )}

          <View style={styles.roleContainer}>
            <View
              style={[
                styles.roleBadge,
                { backgroundColor: getRoleColor(profile?.role) },
              ]}
            >
              <Text style={styles.roleText}>
                {getRoleDisplayName(profile?.role)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Your Activity</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalReports}</Text>
            <Text style={styles.statLabel}>Total Reports</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: "#F59E0B" }]}>
              {stats.pendingReports}
            </Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={[styles.statNumber, { color: "#059669" }]}>
              {stats.resolvedReports}
            </Text>
            <Text style={styles.statLabel}>Resolved</Text>
          </View>
        </View>
      </View>

      {/* Account Information */}
      <View style={styles.infoContainer}>
        <Text style={styles.sectionTitle}>Account Information</Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>User ID</Text>
            <Text style={styles.infoValue}>{profile?.id || "N/A"}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Member Since</Text>
            <Text style={styles.infoValue}>
              {profile?.created_at
                ? new Date(profile.created_at).toLocaleDateString()
                : "N/A"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Barangay Code</Text>
            <Text style={styles.infoValue}>
              {profile?.barangay_code || "N/A"}
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>🚪 Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingBottom: 20, // Add padding to prevent content from being hidden
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  // Header
  header: {
    backgroundColor: "#F8FAFC",
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FF9B00",
  },
  // Profile Card
  profileCard: {
    backgroundColor: "#FFFFFF",
    margin: 20,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#FF9B00",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#FFE100",
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#FF9B00",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#FF9B00",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 3,
    borderColor: "#FFE100",
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  profileInfo: {
    alignItems: "center",
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 4,
    textAlign: "center",
  },
  userEmail: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 12,
    textAlign: "center",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  locationIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  locationText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  roleContainer: {
    marginTop: 8,
  },
  roleBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  roleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  // Stats
  statsContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    marginHorizontal: 4,
    shadowColor: "#FF9B00",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#FFC900",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FF9B00",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  // Info
  infoContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#FF9B00",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#EBE389",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: "600",
  },
  // Actions
  actionsContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: "#FF9B00",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 85, // Add bottom margin to avoid navigation bar
    shadowColor: "#FF9B00",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 2,
    borderColor: "#FFE100",
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  // Footer
  footer: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: "#EBE389",
    margin: 20,
    marginBottom: 100, // Add extra margin to account for bottom navigation
    borderRadius: 16,
  },
  footerText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FF9B00",
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 14,
    color: "#FFC900",
    fontWeight: "600",
  },
});

export default ProfileScreen;
