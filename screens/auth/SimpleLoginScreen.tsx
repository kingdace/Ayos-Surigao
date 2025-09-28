import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Platform,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { useAppMode } from "../../contexts/AppModeContext";
import { Colors } from "../../constants/Colors";
import LoadingButton from "../../components/LoadingButton";
import CustomAlert from "../../components/CustomAlert";

interface Props {
  navigation: any;
}

const SimpleLoginScreen: React.FC<Props> = ({ navigation }) => {
  const { signIn } = useAuth();
  const { switchToAdmin } = useAppMode();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    type: "info" as "success" | "error" | "info",
    title: "",
    message: "",
  });

  const showAlert = (
    type: "success" | "error" | "info",
    title: string,
    message: string
  ) => {
    setAlertConfig({ type, title, message });
    setAlertVisible(true);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showAlert(
        "error",
        "Missing Information",
        "Please enter both your email and password to sign in."
      );
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      // Check if it's an email confirmation error
      if (
        error.message?.includes("email") &&
        error.message?.includes("confirm")
      ) {
        showAlert(
          "error",
          "Account Not Verified",
          "Your account exists but email verification is required. Please check your email for a verification link, or contact support if you need help."
        );
      } else {
        showAlert(
          "error",
          "Login Failed",
          error.message || "Invalid email or password. Please try again."
        );
      }
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Image
              source={require("../../assets/images/sur-logo.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>Ayos Surigao</Text>
          <Text style={styles.subtitle}>
            A community reporting app for Surigao City residents
          </Text>

          {/* Admin Panel Navigation - Text Link */}
          <TouchableOpacity
            style={styles.modeSwitcherText}
            onPress={switchToAdmin}
          >
            <Text style={styles.modeSwitcherTextContent}>
              Switch to Admin Panel
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.form}>
            <Text style={styles.welcomeText}>Welcome Back!</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputIcon}>📧</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={Colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor={Colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
            </View>

            <LoadingButton
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              loadingText="Signing In..."
              backgroundColor={Colors.primary}
              style={styles.loginButton}
            />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.guestButton}
              onPress={() => navigation.navigate("guest")}
            >
              <Text style={styles.guestButtonIcon}>👤</Text>
              <Text style={styles.guestButtonText}>Continue as Guest</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("signup")}>
                <Text style={styles.linkText}>Sign Up</Text>
              </TouchableOpacity>
            </View>

            {/* Developer Signature - Inside scrollable content */}
            <View style={styles.developerSignature}>
              <Text style={styles.developerText}>
                Developed by Dy Mark B. Gales
              </Text>
              <Text style={styles.developerText}>
                BSICT Student – Surigao del Norte State University (SNSU)
              </Text>
              <Text style={styles.copyrightText}>
                © 2025. All rights reserved.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <CustomAlert
        visible={alertVisible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={() => setAlertVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 25,
    paddingHorizontal: 20,
    backgroundColor: Colors.primary,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.textLight,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  icon: {
    fontSize: 35,
  },
  logo: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.textLight,
    fontFamily: Platform.OS === "ios" ? "Avenir-Heavy" : "sans-serif-condensed",
    letterSpacing: 0.5,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: "center",
    opacity: 0.9,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  form: {
    backgroundColor: Colors.background,
    borderRadius: 20,
    padding: 30,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 12,
    backgroundColor: Colors.backgroundLight,
    paddingHorizontal: 14,
    minHeight: 50,
  },
  inputIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    paddingVertical: 16,
  },
  loginButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 10,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    color: Colors.textLight,
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonDisabled: {
    backgroundColor: Colors.textMuted,
    shadowOpacity: 0,
    elevation: 0,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 25,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: 14,
    color: Colors.textMuted,
    marginHorizontal: 15,
  },
  guestButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
    borderWidth: 2,
    borderColor: Colors.secondary,
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 20,
  },
  guestButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  guestButtonText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  linkText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: "bold",
  },
  modeSwitcherText: {
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  modeSwitcherTextContent: {
    fontSize: 12,
    color: Colors.textLight,
    fontWeight: "600",
    textAlign: "center",
  },
  developerSignature: {
    marginTop: 0,
    alignItems: "center",
    paddingVertical: 12,
    paddingBottom: 0,
  },
  developerText: {
    fontSize: 11,
    color: "#666666",
    fontWeight: "500",
    marginBottom: 2,
  },
  copyrightText: {
    fontSize: 9,
    color: "#999999",
    fontWeight: "400",
  },
});

export default SimpleLoginScreen;
