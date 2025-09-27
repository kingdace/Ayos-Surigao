import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Image,
} from "react-native";
import { Colors } from "../constants/Colors";
import { useAdminAuth } from "../contexts/AdminAuthContext";
import AdminLoginScreen from "../screens/admin/AdminLoginScreen";
import AdminDashboardScreen from "../screens/admin/AdminDashboardScreen";
import AdminMapScreen from "../screens/admin/AdminMapScreen";
import AdminProfileScreen from "../screens/admin/AdminProfileScreen";

type AdminScreen = "login" | "dashboard" | "reports" | "map" | "profile";

const AdminNavigator: React.FC = () => {
  const { admin, loading } = useAdminAuth();
  const [currentScreen, setCurrentScreen] = useState<AdminScreen>("login");

  const renderScreen = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      );
    }

    if (!admin) {
      return (
        <AdminLoginScreen
          onLoginSuccess={() => setCurrentScreen("dashboard")}
        />
      );
    }

    switch (currentScreen) {
      case "dashboard":
        return (
          <AdminDashboardScreen
            onNavigateToReports={() => setCurrentScreen("reports")}
            onNavigateToMap={() => setCurrentScreen("map")}
            onNavigateToProfile={() => setCurrentScreen("profile")}
          />
        );
      case "reports":
        return (
          <AdminReportsPlaceholder
            onBack={() => setCurrentScreen("dashboard")}
          />
        );
      case "map":
        return <AdminMapScreen onBack={() => setCurrentScreen("dashboard")} />;
      case "profile":
        return (
          <AdminProfileScreen onBack={() => setCurrentScreen("dashboard")} />
        );
      default:
        return (
          <AdminDashboardScreen
            onNavigateToReports={() => setCurrentScreen("reports")}
            onNavigateToMap={() => setCurrentScreen("map")}
            onNavigateToProfile={() => setCurrentScreen("profile")}
          />
        );
    }
  };

  const renderHeader = () => {
    if (!admin) return null;

    return (
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Ayos Surigao</Text>
          <Text style={styles.headerSubtitle}>Admin Panel Management</Text>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.adminRole}>
            {admin.role.replace("_", " ").toUpperCase()}
          </Text>
          <TouchableOpacity>
            <Image
              source={require("../assets/images/sur-logo.png")}
              style={styles.profileLogo}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderBottomNavigation = () => {
    if (!admin) return null;

    return (
      <View style={styles.floatingNavContainer}>
        <View style={styles.floatingNav}>
          <TouchableOpacity
            style={[
              styles.navItem,
              currentScreen === "dashboard" && styles.activeNavItem,
            ]}
            onPress={() => setCurrentScreen("dashboard")}
          >
            <View
              style={[
                styles.navIconContainer,
                currentScreen === "dashboard" && styles.activeNavIconContainer,
              ]}
            >
              <Text
                style={[
                  styles.navIcon,
                  currentScreen === "dashboard" && styles.activeNavIcon,
                ]}
              >
                🏠
              </Text>
            </View>
            <Text
              style={[
                styles.navLabel,
                currentScreen === "dashboard" && styles.activeNavLabel,
              ]}
            >
              Dashboard
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navItem,
              currentScreen === "reports" && styles.activeNavItem,
            ]}
            onPress={() => setCurrentScreen("reports")}
          >
            <View
              style={[
                styles.navIconContainer,
                currentScreen === "reports" && styles.activeNavIconContainer,
              ]}
            >
              <Text
                style={[
                  styles.navIcon,
                  currentScreen === "reports" && styles.activeNavIcon,
                ]}
              >
                📋
              </Text>
            </View>
            <Text
              style={[
                styles.navLabel,
                currentScreen === "reports" && styles.activeNavLabel,
              ]}
            >
              Reports
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navItem,
              currentScreen === "map" && styles.activeNavItem,
            ]}
            onPress={() => setCurrentScreen("map")}
          >
            <View
              style={[
                styles.navIconContainer,
                currentScreen === "map" && styles.activeNavIconContainer,
              ]}
            >
              <Text
                style={[
                  styles.navIcon,
                  currentScreen === "map" && styles.activeNavIcon,
                ]}
              >
                🗺️
              </Text>
            </View>
            <Text
              style={[
                styles.navLabel,
                currentScreen === "map" && styles.activeNavLabel,
              ]}
            >
              Map
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navItem,
              currentScreen === "profile" && styles.activeNavItem,
            ]}
            onPress={() => setCurrentScreen("profile")}
          >
            <View
              style={[
                styles.navIconContainer,
                currentScreen === "profile" && styles.activeNavIconContainer,
              ]}
            >
              <Text
                style={[
                  styles.navIcon,
                  currentScreen === "profile" && styles.activeNavIcon,
                ]}
              >
                👤
              </Text>
            </View>
            <Text
              style={[
                styles.navLabel,
                currentScreen === "profile" && styles.activeNavLabel,
              ]}
            >
              Profile
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderScreen()}
      {renderBottomNavigation()}
    </View>
  );
};

// Placeholder component for reports management (not yet implemented)
const AdminReportsPlaceholder: React.FC<{ onBack: () => void }> = ({
  onBack,
}) => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderTitle}>Reports Management</Text>
    <Text style={styles.placeholderText}>Coming soon...</Text>
    <TouchableOpacity style={styles.backButton} onPress={onBack}>
      <Text style={styles.backButtonText}>← Back to Dashboard</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
    paddingBottom: 100, // Add padding for floating navigation
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.backgroundLight,
  },
  loadingText: {
    fontSize: 18,
    color: Colors.textSecondary,
  },
  header: {
    backgroundColor: "#FF9B00",
    paddingTop: 45,
    paddingBottom: 12,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#FF9B00",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: "800",
    color: Colors.textLight,
    fontFamily: Platform.OS === "ios" ? "Avenir-Heavy" : "sans-serif-condensed",
    letterSpacing: 0.5,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textLight,
    opacity: 0.9,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  adminRole: {
    fontSize: 11,
    color: Colors.textLight,
    fontWeight: "600",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  profileLogo: {
    width: 45,
    height: 45,
  },
  floatingNavContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    alignItems: "center",
  },
  floatingNav: {
    flexDirection: "row",
    backgroundColor: Colors.background,
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "space-around",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 70,
  },
  navItem: {
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    minWidth: 70,
  },
  activeNavItem: {
    backgroundColor: "#FFFFFF", // Use our color palette
  },
  navIconContainer: {
    width: 30,
    height: 25,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  activeNavIconContainer: {
    backgroundColor: "#FF9B00", // Use our primary color
    borderRadius: 5,
  },
  navIcon: {
    fontSize: 20,
  },
  activeNavIcon: {
    fontSize: 20,
  },
  navLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  activeNavLabel: {
    color: "#FF9B00", // Use our primary color for active text
    fontWeight: "700",
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  placeholderText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 32,
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default AdminNavigator;
