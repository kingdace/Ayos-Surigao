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
import { SURIGAO_BARANGAYS } from "../../types/simple-auth";
import { Colors } from "../../constants/Colors";
import BarangayDropdown from "../../components/BarangayDropdown";
import LoadingButton from "../../components/LoadingButton";
import CustomAlert from "../../components/CustomAlert";

interface Props {
  navigation: any;
}

const SimpleSignUpScreen: React.FC<Props> = ({ navigation }) => {
  const { signUp } = useAuth();
  const { switchToAdmin } = useAppMode();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedBarangay, setSelectedBarangay] = useState("POBLACION");
  const [selectedBarangayName, setSelectedBarangayName] = useState("Poblacion");
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    type: "info" as "success" | "error" | "info",
    title: "",
    message: "",
  });

  const handleBarangaySelect = (code: string, name: string) => {
    setSelectedBarangay(code);
    setSelectedBarangayName(name);
  };

  const showAlert = (
    type: "success" | "error" | "info",
    title: string,
    message: string
  ) => {
    setAlertConfig({ type, title, message });
    setAlertVisible(true);
  };

  const handleSignUp = async () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      showAlert(
        "error",
        "Missing Information",
        "Please fill in all fields to create your account."
      );
      return;
    }

    if (password !== confirmPassword) {
      showAlert(
        "error",
        "Password Mismatch",
        "The passwords you entered do not match. Please try again."
      );
      return;
    }

    if (password.length < 6) {
      showAlert(
        "error",
        "Weak Password",
        "Your password must be at least 6 characters long for security."
      );
      return;
    }

    if (!selectedBarangay) {
      showAlert(
        "error",
        "Barangay Required",
        "Please select your barangay to continue."
      );
      return;
    }

    setLoading(true);
    const { error } = await signUp(
      email,
      password,
      firstName,
      lastName,
      selectedBarangay,
      selectedBarangayName
    );
    setLoading(false);

    if (error) {
      showAlert(
        "error",
        "Registration Failed",
        error.message || "Something went wrong. Please try again."
      );
    } else {
      showAlert(
        "success",
        "Success! Please Proceed to Login",
        `Welcome to Ayos Surigao! Your account has been created successfully. Email verification will be implemented in the future - you can login directly for now and start reporting community issues in Surigao City.`
      );
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Image
              source={require("../../assets/images/sur-logo2.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.title}>Ayos Surigao</Text>
          <Text style={styles.subtitle}>
            Join the community and help make Surigao City better
          </Text>

          {/* Development Mode Switcher - Text Link */}
          {__DEV__ && (
            <TouchableOpacity
              style={styles.modeSwitcherText}
              onPress={switchToAdmin}
            >
              <Text style={styles.modeSwitcherTextContent}>
                Switch to Admin Panel
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.formContainer}>
          <View style={styles.form}>
            <Text style={styles.welcomeText}>Create Account</Text>

            <View style={styles.nameRow}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>First Name</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputIcon}>👤</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="First name"
                    placeholderTextColor={Colors.textMuted}
                    value={firstName}
                    onChangeText={setFirstName}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Last Name</Text>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputIcon}>👤</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Last name"
                    placeholderTextColor={Colors.textMuted}
                    value={lastName}
                    onChangeText={setLastName}
                    autoCapitalize="words"
                  />
                </View>
              </View>
            </View>

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
              <Text style={styles.label}>Barangay</Text>
              <BarangayDropdown
                selectedBarangay={selectedBarangay}
                onSelectBarangay={handleBarangaySelect}
                placeholder="Select your barangay"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Create password (min 6 characters)"
                  placeholderTextColor={Colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Confirm your password"
                  placeholderTextColor={Colors.textMuted}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
            </View>

            <LoadingButton
              title="Create Account"
              onPress={handleSignUp}
              loading={loading}
              loadingText="Creating Account..."
              backgroundColor={Colors.tertiary}
              style={styles.signUpButton}
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("login")}>
                <Text style={styles.linkText}>Sign In</Text>
              </TouchableOpacity>
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
        primaryButton={
          alertConfig.type === "success"
            ? {
                text: "Go to Login",
                onPress: () => {
                  setAlertVisible(false);
                  navigation.navigate("login");
                },
              }
            : undefined
        }
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
    backgroundColor: Colors.tertiary,
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
    marginBottom: 25,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: 30,
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  inputGroup: {
    marginBottom: 20,
  },
  halfWidth: {
    width: "48%",
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
  signUpButton: {
    backgroundColor: Colors.tertiary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 10,
    shadowColor: Colors.tertiary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  signUpButtonText: {
    color: Colors.textLight,
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonDisabled: {
    backgroundColor: Colors.textMuted,
    shadowOpacity: 0,
    elevation: 0,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
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
});

export default SimpleSignUpScreen;
