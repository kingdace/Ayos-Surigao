import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { AuthProvider } from "./contexts/AuthContext";
import { AdminAuthProvider } from "./contexts/AdminAuthContext";
import { AppModeProvider } from "./contexts/AppModeContext";
import { SimpleNavigator } from "./navigation/SimpleNavigator";
import AdminNavigator from "./navigation/AdminNavigator";
import { Colors } from "./constants/Colors";

type AppMode = "public" | "admin";

export default function App() {
  const [appMode, setAppMode] = useState<AppMode>("public");

  // Function to switch modes (can be called from child components)
  const switchToAdmin = () => setAppMode("admin");
  const switchToPublic = () => setAppMode("public");

  const renderModeSelector = () => (
    <View style={styles.modeSelector}>
      <View style={styles.header}>
        <Text style={styles.title}>Ayos Surigao</Text>
        <Text style={styles.subtitle}>Select Access Mode</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.modeButton, styles.publicButton]}
          onPress={() => setAppMode("public")}
        >
          <Text style={styles.modeIcon}>👥</Text>
          <Text style={styles.modeTitle}>Public App</Text>
          <Text style={styles.modeDescription}>
            For residents and community members
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeButton, styles.adminButton]}
          onPress={() => setAppMode("admin")}
        >
          <Text style={styles.modeIcon}>🛡️</Text>
          <Text style={styles.modeTitle}>Admin Panel</Text>
          <Text style={styles.modeDescription}>
            For operations center staff
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <AppModeProvider
      switchToAdmin={switchToAdmin}
      switchToPublic={switchToPublic}
      currentMode={appMode}
    >
      <View style={styles.container}>
        {appMode === "public" ? (
          <AuthProvider>
            <SimpleNavigator />
          </AuthProvider>
        ) : (
          <AdminAuthProvider>
            <AdminNavigator />
          </AdminAuthProvider>
        )}

        <StatusBar style="auto" />
      </View>
    </AppModeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  modeSelector: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.backgroundLight,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  buttonContainer: {
    width: "100%",
    maxWidth: 300,
    gap: 20,
  },
  modeButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  publicButton: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  adminButton: {
    borderWidth: 2,
    borderColor: "#6B7280",
  },
  modeIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  modeTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  modeDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
  },
});
