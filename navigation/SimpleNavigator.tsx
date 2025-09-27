import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import LoadingScreen from "../components/LoadingScreen";
import { Colors } from "../constants/Colors";

// Simple screens without complex navigation
import SimpleLoginScreen from "../screens/auth/SimpleLoginScreen";
import SimpleSignUpScreen from "../screens/auth/SimpleSignUpScreen";
import GuestScreen from "../screens/main/GuestScreen";
import HomeScreen from "../screens/main/HomeScreen";
import ReportsListScreenEnhanced from "../screens/reports/ReportsListScreenEnhanced";
import MapScreen from "../screens/map/MapScreen";
import CreateReportEnhanced from "../screens/reports/CreateReportEnhanced";
import ProfileScreen from "../screens/profile/ProfileScreen";
import GuestProfileScreen from "../screens/profile/GuestProfileScreen";

type Screen =
  | "login"
  | "signup"
  | "guest"
  | "home"
  | "reports"
  | "map"
  | "create"
  | "profile";

export const SimpleNavigator = () => {
  const { user, loading, signOut, isSigningUp } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>("login");
  const [reportsInitialTab, setReportsInitialTab] = useState<"all" | "my">(
    "all"
  );

  if (loading) {
    return <LoadingScreen />;
  }

  // Debug logging
  console.log("Navigator State:", {
    user: !!user,
    currentScreen,
    isSigningUp,
    userEmail: user?.email,
  });

  // Simple navigation object
  const navigation = {
    navigate: (screen: Screen, params?: any) => {
      console.log("Navigating to:", screen, "with params:", params); // Debug log

      // Handle special cases for reports screen
      if (screen === "reports" && params?.activeTab) {
        setReportsInitialTab(params.activeTab);
      }

      setCurrentScreen(screen);
    },
  };

  // Logout function
  const handleLogout = async () => {
    await signOut();
    setCurrentScreen("login");
  };

  // Guest main app screens (same as logged in but with guest header)
  const renderGuestScreen = () => {
    switch (currentScreen) {
      case "home":
        return <HomeScreen navigation={navigation} />;
      case "reports":
        return <ReportsListScreenEnhanced initialTab={reportsInitialTab} />;
      case "map":
        return <MapScreen />;
      case "create":
        return <CreateReportEnhanced />;
      case "profile":
        return <GuestProfileScreen navigation={navigation} />;
      default:
        return <HomeScreen navigation={navigation} />;
    }
  };

  const renderGuestMainApp = () => {
    return (
      <View style={styles.container}>
        {/* Guest Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Ayos Surigao (Guest)</Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => setCurrentScreen("login")}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </View>

        {/* Screen Content */}
        <View style={styles.content}>{renderGuestScreen()}</View>

        {/* Floating Navigation for Guest */}
        <View style={styles.floatingNavContainer}>
          <View style={styles.floatingNav}>
            <TouchableOpacity
              style={[
                styles.navItem,
                currentScreen === "home" && styles.activeNavItem,
              ]}
              onPress={() => setCurrentScreen("home")}
            >
              <View
                style={[
                  styles.navIconContainer,
                  currentScreen === "home" && styles.activeNavIconContainer,
                ]}
              >
                <Text
                  style={[
                    styles.navIcon,
                    currentScreen === "home" && styles.activeNavIcon,
                  ]}
                >
                  🏠
                </Text>
              </View>
              <Text
                style={[
                  styles.navLabel,
                  currentScreen === "home" && styles.activeNavLabel,
                ]}
              >
                Home
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

            {/* Center Create Button - Special Design */}
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => setCurrentScreen("create")}
            >
              <View style={styles.createButtonInner}>
                <Text style={styles.createIcon}>➕</Text>
              </View>
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
              style={[styles.navItem]}
              onPress={() => setCurrentScreen("guest")}
            >
              <View style={styles.navIconContainer}>
                <Text style={styles.navIcon}>👤</Text>
              </View>
              <Text style={styles.navLabel}>Guest</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // Auth screens for non-logged in users
  if (!user) {
    console.log(
      "No user, showing auth screens. Current screen:",
      currentScreen
    );

    if (currentScreen === "signup") {
      return <SimpleSignUpScreen navigation={navigation} />;
    } else if (currentScreen === "guest") {
      return <GuestScreen navigation={navigation} />;
    } else if (currentScreen === "login") {
      return <SimpleLoginScreen navigation={navigation} />;
    } else if (
      currentScreen === "home" ||
      currentScreen === "reports" ||
      currentScreen === "map" ||
      currentScreen === "create"
    ) {
      // Guest accessing main app screens
      return renderGuestMainApp();
    }

    // Default to login screen for any other case
    console.log("Defaulting to login screen");
    return <SimpleLoginScreen navigation={navigation} />;
  }

  // Main app screens for logged in users

  const renderScreen = () => {
    // If user is logged in but still on auth screens, redirect to home
    // BUT NOT during signup process to prevent auto-login
    if (
      user &&
      !isSigningUp &&
      (currentScreen === "login" ||
        currentScreen === "signup" ||
        currentScreen === "guest")
    ) {
      setCurrentScreen("home");
      return <HomeScreen navigation={navigation} />;
    }

    switch (currentScreen) {
      case "home":
        return <HomeScreen navigation={navigation} />;
      case "reports":
        return <ReportsListScreenEnhanced initialTab={reportsInitialTab} />;
      case "map":
        return <MapScreen />;
      case "create":
        return <CreateReportEnhanced />;
      case "profile":
        return user ? (
          <ProfileScreen />
        ) : (
          <GuestProfileScreen navigation={navigation} />
        );
      default:
        return <HomeScreen navigation={navigation} />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>
            {user ? `Ayos Surigao` : `Welcome! 👋`}
          </Text>
          <Text style={styles.headerSubtitle}>
            A community reporting app for Surigao City
          </Text>
        </View>
        <View style={styles.logoContainer}>
          <Image
            source={require("../assets/images/sur-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Screen Content */}
      <View style={styles.content}>{renderScreen()}</View>

      {/* Floating Bottom Navigation */}
      <View style={styles.floatingNavContainer}>
        <View style={styles.floatingNav}>
          <TouchableOpacity
            style={[
              styles.navItem,
              currentScreen === "home" && styles.activeNavItem,
            ]}
            onPress={() => setCurrentScreen("home")}
          >
            <View
              style={[
                styles.navIconContainer,
                currentScreen === "home" && styles.activeNavIconContainer,
              ]}
            >
              <Text
                style={[
                  styles.navIcon,
                  currentScreen === "home" && styles.activeNavIcon,
                ]}
              >
                🏠
              </Text>
            </View>
            <Text
              style={[
                styles.navLabel,
                currentScreen === "home" && styles.activeNavLabel,
              ]}
            >
              Home
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

          {/* Center Create Button - Special Design */}
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setCurrentScreen("create")}
          >
            <View style={styles.createButtonInner}>
              <Text style={styles.createIcon}>➕</Text>
            </View>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    fontSize: 18,
    color: "#666",
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
  headerContent: {
    flex: 1,
  },
  loginButton: {
    backgroundColor: Colors.textLight,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  loginButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
  logoContainer: {
    width: 50,
    height: 50,
  },
  logo: {
    width: "100%",
    height: "100%",
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
    opacity: 0.8,
    marginTop: 1,
  },
  content: {
    flex: 1,
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
    borderRadius: 25,
    paddingVertical: 6,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "space-around",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  navItem: {
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    minWidth: 60,
  },
  activeNavItem: {
    backgroundColor: "#FFFFFF", // Use our color palette
  },
  navIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 3,
  },
  activeNavIconContainer: {
    backgroundColor: "#FF9B00", // Use our primary color
    borderRadius: 8,
  },
  navIcon: {
    fontSize: 16,
  },
  activeNavIcon: {
    fontSize: 16,
  },
  navLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  activeNavLabel: {
    color: "#FF9B00", // Use our primary color for active text
    fontWeight: "700",
  },
  createButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.tertiary,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 8,
    shadowColor: Colors.tertiary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  createButtonInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.textLight,
    alignItems: "center",
    justifyContent: "center",
  },
  createIcon: {
    fontSize: 20,
    color: Colors.tertiary,
    fontWeight: "bold",
  },
});
