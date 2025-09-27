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
import { useAdminAuth } from "../../contexts/AdminAuthContext";

const { width } = Dimensions.get("window");

interface AdminProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  barangay_code?: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
}

const AdminProfileScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { admin, logout } = useAdminAuth();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (admin) {
      loadAdminProfile();
    }
  }, [admin]);

  const loadAdminProfile = async () => {
    try {
      setLoading(true);
      // For admin, we already have the profile data from the auth context
      if (admin) {
        setProfile({
          id: admin.id,
          email: admin.email,
          first_name: admin.first_name,
          last_name: admin.last_name,
          role: admin.role,
          barangay_code: admin.barangay_code,
          is_active: admin.is_active,
          last_login: admin.last_login,
          created_at: new Date().toISOString(), // We don't have this in admin context
        });
      }
    } catch (error) {
      console.error("Error loading admin profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout from the admin panel?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error("Logout error:", error);
              Alert.alert("Error", "Failed to logout. Please try again.");
            }
          },
        },
      ]
    );
  };

  const getRoleDisplayName = (role: string) => {
    return role.replace("_", " ").toUpperCase();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "#EF4444";
      case "operations_manager":
        return "#3B82F6";
      case "barangay_admin":
        return "#10B981";
      case "field_coordinator":
        return "#F59E0B";
      case "data_analyst":
        return "#8B5CF6";
      default:
        return Colors.primary;
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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Image
            source={require("../../assets/images/sur-logo4.png")}
            style={styles.avatar}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.adminName}>
          {profile?.first_name} {profile?.last_name}
        </Text>
        <Text style={styles.adminEmail}>{profile?.email}</Text>
        <View
          style={[
            styles.roleBadge,
            { backgroundColor: getRoleColor(profile?.role || "") + "20" },
          ]}
        >
          <Text
            style={[
              styles.roleText,
              { color: getRoleColor(profile?.role || "") },
            ]}
          >
            {getRoleDisplayName(profile?.role || "")}
          </Text>
        </View>
      </View>

      {/* Account Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Information</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Admin ID</Text>
            <Text style={styles.infoValue}>{profile?.id}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{profile?.email}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Full Name</Text>
            <Text style={styles.infoValue}>
              {profile?.first_name} {profile?.last_name}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Role</Text>
            <Text style={styles.infoValue}>
              {getRoleDisplayName(profile?.role || "")}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status</Text>
            <View style={styles.statusContainer}>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: profile?.is_active ? "#10B981" : "#EF4444",
                  },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: profile?.is_active ? "#10B981" : "#EF4444" },
                ]}
              >
                {profile?.is_active ? "Active" : "Inactive"}
              </Text>
            </View>
          </View>
          {profile?.barangay_code && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Assigned Barangay</Text>
              <Text style={styles.infoValue}>{profile.barangay_code}</Text>
            </View>
          )}
          {profile?.last_login && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Last Login</Text>
              <Text style={styles.infoValue}>
                {new Date(profile.last_login).toLocaleString()}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Admin Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Admin Actions</Text>
        <View style={styles.actionsCard}>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>⚙️</Text>
            <Text style={styles.actionText}>Settings</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={styles.actionText}>Analytics</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>👥</Text>
            <Text style={styles.actionText}>User Management</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>🔧</Text>
            <Text style={styles.actionText}>System Tools</Text>
            <Text style={styles.actionArrow}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Logout Section */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>Logout from Admin Panel</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Ayos Surigao Admin Panel</Text>
        <Text style={styles.footerSubtext}>
          Operations Center Management System
        </Text>
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
    fontSize: 16,
    color: Colors.textSecondary,
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: Colors.background,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.backgroundLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatar: {
    width: 80,
    height: 80,
  },
  adminName: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  adminEmail: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  roleBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleText: {
    fontSize: 12,
    fontWeight: "700",
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
    flex: 1,
    textAlign: "right",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
  },
  actionsCard: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  actionIcon: {
    fontSize: 20,
    marginRight: 16,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: "500",
  },
  actionArrow: {
    fontSize: 20,
    color: Colors.textSecondary,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EF4444",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 20,
  },
  logoutIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  logoutText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  footer: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: "600",
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: Colors.textMuted,
  },
});

export default AdminProfileScreen;
