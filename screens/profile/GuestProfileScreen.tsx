import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Dimensions,
} from "react-native";
import { Colors } from "../../constants/Colors";

const { width } = Dimensions.get("window");

interface GuestProfileScreenProps {
  navigation?: any;
}

const GuestProfileScreen: React.FC<GuestProfileScreenProps> = ({
  navigation,
}) => {
  const handleCreateAccount = () => {
    if (navigation) {
      navigation.navigate("signup");
    }
  };

  const handleLogin = () => {
    if (navigation) {
      navigation.navigate("login");
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Guest Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
        </View>

        <View style={styles.profileInfo}>
          <Text style={styles.userName}>Guest User</Text>
          <Text style={styles.userEmail}>Browsing as guest</Text>

          <View style={styles.roleContainer}>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>Guest</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Guest Stats */}
      <View style={styles.statsContainer}>
        <Text style={styles.sectionTitle}>Guest Mode</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>∞</Text>
            <Text style={styles.statLabel}>Browse Reports</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>∞</Text>
            <Text style={styles.statLabel}>View Map</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>∞</Text>
            <Text style={styles.statLabel}>Create Reports</Text>
          </View>
        </View>
      </View>

      {/* Guest Limitations Info */}
      <View style={styles.infoContainer}>
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Guest Mode Limitations:</Text>
          <View style={styles.limitationItem}>
            <Text style={styles.limitationIcon}>❌</Text>
            <Text style={styles.limitationText}>Cannot track your reports</Text>
          </View>
          <View style={styles.limitationItem}>
            <Text style={styles.limitationIcon}>❌</Text>
            <Text style={styles.limitationText}>Cannot receive updates</Text>
          </View>
          <View style={styles.limitationItem}>
            <Text style={styles.limitationIcon}>❌</Text>
            <Text style={styles.limitationText}>
              Cannot access profile features
            </Text>
          </View>
          <View style={styles.limitationItem}>
            <Text style={styles.limitationIcon}>❌</Text>
            <Text style={styles.limitationText}>Cannot vote on reports</Text>
          </View>
        </View>
      </View>

      {/* Guest Benefits */}
      <View style={styles.infoContainer}>
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>What you can do as Guest:</Text>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>✅</Text>
            <Text style={styles.benefitText}>Browse all community reports</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>✅</Text>
            <Text style={styles.benefitText}>
              View reports on interactive map
            </Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>✅</Text>
            <Text style={styles.benefitText}>Submit anonymous reports</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>✅</Text>
            <Text style={styles.benefitText}>Filter reports by category</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.createAccountButton}
          onPress={handleCreateAccount}
        >
          <Text style={styles.createAccountButtonText}>
            Create Account for Full Features
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>
            Already have an account? Login
          </Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Continue browsing as guest or create an account to unlock all
          features!
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingBottom: 20,
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
  roleContainer: {
    marginTop: 8,
  },
  roleBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFC900",
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
    textAlign: "center",
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
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  limitationItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  limitationIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  limitationText: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  benefitIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  benefitText: {
    fontSize: 14,
    color: Colors.textPrimary,
    flex: 1,
    fontWeight: "500",
  },
  // Actions
  actionsContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  createAccountButton: {
    backgroundColor: "#FF9B00",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#FF9B00",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  createAccountButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  loginButton: {
    backgroundColor: "transparent",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FF9B00",
  },
  loginButtonText: {
    color: "#FF9B00",
    fontSize: 16,
    fontWeight: "600",
  },
  // Footer
  footer: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FFE100",
  },
  footerText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
});

export default GuestProfileScreen;
