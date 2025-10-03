import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Colors } from "../../constants/Colors";

interface Props {
  navigation: any;
}

const GuestScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.icon}>👤</Text>
        <Text style={styles.title}>Guest Mode</Text>
        <Text style={styles.subtitle}>
          Browse and report issues without creating an account
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>What you can do as a Guest:</Text>
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📋</Text>
              <Text style={styles.featureText}>View all community reports</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🗺️</Text>
              <Text style={styles.featureText}>See reports on the map</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>➕</Text>
              <Text style={styles.featureText}>Submit anonymous reports</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🔍</Text>
              <Text style={styles.featureText}>Filter reports by category</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Limitations:</Text>
          <View style={styles.limitationList}>
            <View style={styles.limitationItem}>
              <Text style={styles.limitationIcon}>❌</Text>
              <Text style={styles.limitationText}>
                Cannot track your reports
              </Text>
            </View>
            <View style={styles.limitationItem}>
              <Text style={styles.limitationIcon}>❌</Text>
              <Text style={styles.limitationText}>Cannot receive updates</Text>
            </View>
            <View style={styles.limitationItem}>
              <Text style={styles.limitationIcon}>❌</Text>
              <Text style={styles.limitationText}>Cannot vote on reports</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => navigation.navigate("home")}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>Continue as Guest</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Want full features? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("signup")}>
            <Text style={styles.linkText}>Create Account</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate("login")}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  header: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: Colors.primary,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  icon: {
    fontSize: 48,
    marginBottom: 8,
    color: "#FFFFFF",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 10,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    alignItems: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    width: "100%",
    maxWidth: 350,
    alignSelf: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 16,
    textAlign: "center",
  },
  featureList: {
    gap: 8,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    marginVertical: 2,
  },
  featureIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
    textAlign: "center",
  },
  featureText: {
    fontSize: 16,
    color: Colors.success,
    fontWeight: "500",
    flex: 1,
  },
  limitationList: {
    gap: 8,
  },
  limitationItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: "#FEF2F2",
    borderRadius: 8,
    marginVertical: 2,
  },
  limitationIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
    textAlign: "center",
  },
  limitationText: {
    fontSize: 16,
    color: Colors.error,
    fontWeight: "500",
    flex: 1,
  },
  continueButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
    marginBottom: 12,
    width: "100%",
    maxWidth: 350,
    alignSelf: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  continueButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 20,
    width: "100%",
    maxWidth: 350,
    alignSelf: "center",
  },
  footerText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  linkText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: "600",
    marginLeft: 4,
  },
  backButton: {
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 24,
    width: "100%",
    maxWidth: 350,
    alignSelf: "center",
  },
  backButtonText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: "500",
    textDecorationLine: "underline",
  },
});

export default GuestScreen;
