import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  Dimensions,
  Alert,
  Platform,
} from "react-native";
import { Colors } from "../../constants/Colors";
import { useAuth } from "../../contexts/AuthContext";
import LoadingButton from "../../components/LoadingButton";
import CustomAlert from "../../components/CustomAlert";
import { simpleOperationsService } from "../../lib/operations-service-simple";
import LocationPicker, { LocationData } from "../../components/LocationPicker";
import ImageUploadFixed, { ImageData } from "../../components/ImageUploadFixed";
import { supabase } from "../../lib/supabase";
import { SURIGAO_BARANGAYS } from "../../types/simple-auth";

const { width, height } = Dimensions.get("window");

// Enhanced category options with better icons and descriptions
const ENHANCED_CATEGORIES = [
  {
    value: "broken_lights",
    label: "Street Lights",
    icon: "💡",
    description: "Broken or malfunctioning street lights",
    color: "#F59E0B",
  },
  {
    value: "trash_collection",
    label: "Waste Management",
    icon: "🗑️",
    description: "Garbage collection and disposal issues",
    color: "#10B981",
  },
  {
    value: "water_issues",
    label: "Water Systems",
    icon: "💧",
    description: "Water supply, leaks, or quality problems",
    color: "#3B82F6",
  },
  {
    value: "road_damage",
    label: "Road Infrastructure",
    icon: "🛣️",
    description: "Potholes, cracks, or damaged roads",
    color: "#8B5CF6",
  },
  {
    value: "drainage",
    label: "Drainage & Flooding",
    icon: "🌊",
    description: "Clogged drains or flooding issues",
    color: "#06B6D4",
  },
  {
    value: "noise_complaint",
    label: "Noise Issues",
    icon: "🔊",
    description: "Excessive noise or disturbances",
    color: "#EF4444",
  },
  {
    value: "public_safety",
    label: "Public Safety",
    icon: "🚨",
    description: "Safety hazards or security concerns",
    color: "#DC2626",
  },
  {
    value: "other",
    label: "Other Issues",
    icon: "📝",
    description: "Issues not covered by other categories",
    color: "#6B7280",
  },
];

// Enhanced priority levels
const PRIORITY_LEVELS = [
  {
    value: "low",
    label: "Low Priority",
    icon: "🟢",
    description: "Can be addressed in regular schedule",
    color: "#10B981",
  },
  {
    value: "medium",
    label: "Medium Priority",
    icon: "🟡",
    description: "Should be addressed soon",
    color: "#F59E0B",
  },
  {
    value: "high",
    label: "High Priority",
    icon: "🟠",
    description: "Needs immediate attention",
    color: "#F97316",
  },
  {
    value: "critical",
    label: "Critical",
    icon: "🔴",
    description: "Emergency - requires immediate action",
    color: "#EF4444",
  },
];

export default function CreateReportEnhanced() {
  const { user } = useAuth();
  const scrollViewRef = useRef<ScrollView>(null);

  // Form state
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState<string | null>(null);
  const [specificLocation, setSpecificLocation] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(!user); // Auto-set to true for guest users
  const [reporterContact, setReporterContact] = useState("");
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  const [images, setImages] = useState<ImageData[]>([]);

  // UI state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showBarangayModal, setShowBarangayModal] = useState(false);
  const [barangays, setBarangays] = useState<any[]>([]);
  const [selectedBarangay, setSelectedBarangay] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  // Alert state
  const [showAlert, setShowAlert] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    type: "success" as "success" | "error",
    title: "",
    message: "",
  });

  useEffect(() => {
    loadBarangays();
    loadUserLocation();
    if (user) {
      loadUserProfile();
    }
    // Ensure anonymous flag is set correctly based on user status
    setIsAnonymous(!user);
  }, [user]);

  const loadBarangays = async () => {
    try {
      const { data, error } = await simpleOperationsService.getBarangays();
      if (data && !error) {
        setBarangays(data);
      }
    } catch (error) {
      console.error("Error loading barangays:", error);
    }
  };

  const loadUserLocation = async () => {
    try {
      if (user) {
        // TODO: Implement getUserProfile method in operations service
        // For now, we'll skip automatic barangay selection
        // const { data: profile } = await simpleOperationsService.getUserProfile(user.id);
        // if (profile && profile.barangay_code) {
        //   const userBarangay = barangays.find((b) => b.code === profile.barangay_code);
        //   if (userBarangay) {
        //     setSelectedBarangay(userBarangay);
        //   }
        // }
      }
    } catch (error) {
      console.error("Error getting location:", error);
    }
  };

  const loadUserProfile = async () => {
    try {
      if (!user) return;

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("barangay_code, barangay_name, first_name, last_name")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error loading user profile:", error);
        return;
      }

      if (profile) {
        setUserProfile(profile);
        // Set default barangay from user's profile
        const userBarangay = SURIGAO_BARANGAYS.find(
          (b) => b.code === profile.barangay_code
        );
        if (userBarangay) {
          setSelectedBarangay(userBarangay);
        }
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
    }
  };

  const handleLocationPick = () => {
    setShowLocationModal(true);
  };

  const handleSubmit = async () => {
    // Enhanced validation
    if (!title.trim()) {
      showErrorAlert(
        "Missing Information",
        "Please enter a title for your report."
      );
      return;
    }

    if (title.trim().length < 5) {
      showErrorAlert(
        "Invalid Title",
        "Title must be at least 5 characters long."
      );
      return;
    }

    if (!description.trim()) {
      showErrorAlert(
        "Missing Information",
        "Please provide a description of the issue."
      );
      return;
    }

    if (description.trim().length < 10) {
      showErrorAlert(
        "Invalid Description",
        "Description must be at least 10 characters long."
      );
      return;
    }

    if (!category) {
      showErrorAlert(
        "Missing Information",
        "Please select a category for your report."
      );
      return;
    }

    if (!priority) {
      showErrorAlert(
        "Missing Information",
        "Please select a priority level for your report."
      );
      return;
    }

    if (!specificLocation.trim()) {
      showErrorAlert(
        "Missing Information",
        "Please describe the specific location of the issue."
      );
      return;
    }

    if (!selectedBarangay) {
      showErrorAlert(
        "Missing Information",
        "Please select a barangay for your report."
      );
      return;
    }

    if (isAnonymous && !reporterContact.trim()) {
      showErrorAlert(
        "Missing Information",
        "Please provide contact information for anonymous reports."
      );
      return;
    }

    setLoading(true);

    try {
      // Upload images first if any
      let photoUrls: string[] = [];
      if (images.length > 0) {
        const uploadResult = await simpleOperationsService.uploadImages(
          images.map((img) => ({ uri: img.uri, fileName: img.fileName }))
        );

        if (uploadResult.error) {
          throw new Error(
            "Failed to upload images: " + uploadResult.error.message
          );
        }

        photoUrls = uploadResult.urls;
      }

      const reportData = {
        title: title.trim(),
        description: description.trim(),
        category,
        urgency: priority,
        barangay_code: selectedBarangay?.code,
        barangay_name: selectedBarangay?.name,
        specific_location: specificLocation.trim(),
        latitude: locationData?.latitude,
        longitude: locationData?.longitude,
        is_anonymous: isAnonymous,
        reporter_contact: isAnonymous ? reporterContact.trim() : undefined,
        photo_urls: photoUrls.length > 0 ? photoUrls : undefined,
      };

      const { data, error } = await simpleOperationsService.createReport(
        reportData
      );

      if (error) {
        throw error;
      }

      // Success
      setAlertConfig({
        type: "success",
        title: "Report Submitted Successfully! 🎉",
        message: `Your report "${data?.report_number}" has been submitted${
          images.length > 0 ? ` with ${images.length} photo(s)` : ""
        } and will be reviewed by our operations team. You can view all reports in the Reports tab.`,
      });
      setShowAlert(true);

      // Reset form after a brief delay to show success
      setTimeout(() => {
        resetForm();
      }, 1000);
    } catch (error) {
      console.error("Error submitting report:", error);
      showErrorAlert(
        "Submission Failed",
        "We couldn't submit your report right now. Please check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("");
    setPriority(null);
    setSpecificLocation("");
    setIsAnonymous(!user); // Reset to appropriate value based on user status
    setReporterContact("");
    setLocationData(null);
    setImages([]);
    // Reset to user's default barangay
    if (userProfile) {
      const userBarangay = SURIGAO_BARANGAYS.find(
        (b) => b.code === userProfile.barangay_code
      );
      if (userBarangay) {
        setSelectedBarangay(userBarangay);
      }
    }
  };

  const showErrorAlert = (title: string, message: string) => {
    setAlertConfig({ type: "error", title, message });
    setShowAlert(true);
  };

  const getSelectedCategory = () => {
    return ENHANCED_CATEGORIES.find((c) => c.value === category);
  };

  const getSelectedPriority = () => {
    return PRIORITY_LEVELS.find((p) => p.value === priority);
  };

  const handleLocationSelect = (location: LocationData) => {
    setLocationData(location);
    setShowLocationModal(false);
  };

  return (
    <View style={styles.container}>
      {/* Compact Page Header */}
      <View style={styles.compactPageHeader}>
        <Text style={styles.pageTitle}>📝 Report Issue</Text>
        <Text style={styles.pageSubtitle}>Help improve your community</Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.modernForm}>
          {/* Modern Card Container */}
          <View style={styles.formCard}>
            {/* Title */}
            <View style={styles.modernInputGroup}>
              <View style={styles.inputHeader}>
                <Text style={styles.modernLabel}>What's the issue?</Text>
                <Text style={styles.required}>*</Text>
              </View>
              <TextInput
                style={styles.modernInput}
                value={title}
                onChangeText={setTitle}
                placeholder="Brief, clear title (e.g., 'Broken streetlight on Main St')"
                maxLength={100}
                placeholderTextColor="#9CA3AF"
              />
              <Text style={styles.modernCharCount}>{title.length}/100</Text>
            </View>

            {/* Category Selection */}
            <View style={styles.modernInputGroup}>
              <View style={styles.inputHeader}>
                <Text style={styles.modernLabel}>Category</Text>
                <Text style={styles.required}>*</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.modernSelector,
                  category && styles.modernSelectorSelected,
                ]}
                onPress={() => setShowCategoryModal(true)}
              >
                {getSelectedCategory() ? (
                  <View style={styles.modernSelectedOption}>
                    <Text style={styles.modernSelectedIcon}>
                      {getSelectedCategory()?.icon}
                    </Text>
                    <View style={styles.modernSelectedContent}>
                      <Text style={styles.modernSelectedLabel}>
                        {getSelectedCategory()?.label}
                      </Text>
                      <Text style={styles.modernSelectedDescription}>
                        {getSelectedCategory()?.description}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <Text style={styles.modernPlaceholder}>
                    Select issue category
                  </Text>
                )}
                <Text style={styles.modernArrow}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Priority Selection */}
            <View style={styles.modernInputGroup}>
              <Text style={styles.modernLabel}>Priority Level</Text>
              <TouchableOpacity
                style={[
                  styles.modernSelector,
                  priority
                    ? styles.modernSelectorSelected
                    : styles.modernSelectorEmpty,
                ]}
                onPress={() => setShowPriorityModal(true)}
              >
                <View style={styles.modernSelectedOption}>
                  <Text style={styles.modernSelectedIcon}>
                    {priority ? getSelectedPriority()?.icon : "⚪"}
                  </Text>
                  <View style={styles.modernSelectedContent}>
                    <Text
                      style={[
                        styles.modernSelectedLabel,
                        !priority && styles.placeholderText,
                      ]}
                    >
                      {priority
                        ? getSelectedPriority()?.label
                        : "Select Priority Level"}
                    </Text>
                    <Text
                      style={[
                        styles.modernSelectedDescription,
                        !priority && styles.placeholderText,
                      ]}
                    >
                      {priority
                        ? getSelectedPriority()?.description
                        : "Choose how urgent this issue is"}
                    </Text>
                  </View>
                </View>
                <Text style={styles.modernArrow}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Location Section */}
            <View style={styles.modernInputGroup}>
              <View style={styles.inputHeader}>
                <Text style={styles.modernLabel}>Location</Text>
                <Text style={styles.required}>*</Text>
              </View>

              {/* Map Location Button */}
              <TouchableOpacity
                style={styles.locationButton}
                onPress={handleLocationPick}
              >
                <Text style={styles.locationIcon}>📍</Text>
                <View style={styles.locationContent}>
                  <Text style={styles.locationText}>
                    {locationData
                      ? `${locationData.latitude.toFixed(
                          4
                        )}, ${locationData.longitude.toFixed(4)}`
                      : "Pick Location on Map"}
                  </Text>
                  <Text style={styles.locationSubtext}>
                    {locationData
                      ? "Tap to change location"
                      : "Tap to open map"}
                  </Text>
                </View>
                <Text style={styles.modernArrow}>›</Text>
              </TouchableOpacity>

              {/* Location Description */}
              <TextInput
                style={styles.modernTextArea}
                value={specificLocation}
                onChangeText={setSpecificLocation}
                placeholder="Describe the exact location (street, landmark, building, etc.)"
                multiline
                numberOfLines={3}
                maxLength={200}
                placeholderTextColor="#9CA3AF"
              />
              <Text style={styles.modernCharCount}>
                {specificLocation.length}/200
              </Text>
            </View>

            {/* Barangay */}
            {/* Barangay Selection */}
            <View style={styles.modernInputGroup}>
              <Text style={styles.modernLabel}>Barangay</Text>
              <TouchableOpacity
                style={styles.modernSelector}
                onPress={() => setShowBarangayModal(true)}
              >
                <View style={styles.modernSelectedOption}>
                  <Text style={styles.modernSelectedIcon}>🏘️</Text>
                  <View style={styles.modernSelectedContent}>
                    <Text style={styles.modernSelectedLabel}>
                      {selectedBarangay
                        ? selectedBarangay.name
                        : "Select Barangay"}
                    </Text>
                    <Text style={styles.modernSelectedDescription}>
                      {selectedBarangay
                        ? `Code: ${selectedBarangay.code}`
                        : "Choose the barangay where the issue is located"}
                    </Text>
                  </View>
                </View>
                <Text style={styles.modernArrow}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Description */}
            <View style={styles.modernInputGroup}>
              <View style={styles.inputHeader}>
                <Text style={styles.modernLabel}>Detailed Description</Text>
                <Text style={styles.required}>*</Text>
              </View>
              <TextInput
                style={styles.modernTextAreaLarge}
                value={description}
                onChangeText={setDescription}
                placeholder="Provide detailed information about the issue. Include when it started, how it affects the community, and any other relevant details."
                multiline
                numberOfLines={6}
                maxLength={500}
                placeholderTextColor="#9CA3AF"
              />
              <Text style={styles.modernCharCount}>
                {description.length}/500
              </Text>
            </View>

            {/* Photo Upload */}
            <ImageUploadFixed
              images={images}
              onImagesChange={setImages}
              maxImages={3}
              title="Attach Evidence Photos"
            />

            {/* Anonymous Reporting */}
            <View style={styles.modernInputGroup}>
              <TouchableOpacity
                style={[
                  styles.modernCheckboxContainer,
                  !user && styles.disabledCheckboxContainer,
                ]}
                onPress={() => user && setIsAnonymous(!isAnonymous)}
                disabled={!user}
              >
                <View
                  style={[
                    styles.modernCheckbox,
                    isAnonymous && styles.modernCheckboxChecked,
                    !user && styles.disabledCheckbox,
                  ]}
                >
                  {isAnonymous && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <View style={styles.checkboxContent}>
                  <Text
                    style={[
                      styles.modernCheckboxLabel,
                      !user && styles.disabledText,
                    ]}
                  >
                    {user
                      ? "Submit anonymously"
                      : "Submitting as anonymous (Guest mode)"}
                  </Text>
                  <Text
                    style={[
                      styles.modernCheckboxDescription,
                      !user && styles.disabledText,
                    ]}
                  >
                    {user
                      ? "Your identity will be kept private, but you must provide contact info"
                      : "Guest users must submit anonymously"}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Contact for Anonymous */}
            {isAnonymous && (
              <View style={styles.modernInputGroup}>
                <View style={styles.inputHeader}>
                  <Text style={styles.modernLabel}>Contact Information</Text>
                  <Text style={styles.required}>*</Text>
                </View>
                <TextInput
                  style={styles.modernInput}
                  value={reporterContact}
                  onChangeText={setReporterContact}
                  placeholder="Phone number or email for follow-up"
                  maxLength={100}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            )}
          </View>

          {/* Submit Button */}
          <LoadingButton
            title="Submit Report"
            onPress={handleSubmit}
            loading={loading}
            style={styles.submitButton}
          />
        </View>
      </ScrollView>

      {/* Category Modal */}
      <Modal
        visible={showCategoryModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Category</Text>
            <TouchableOpacity
              onPress={() => setShowCategoryModal(false)}
              style={styles.modalCloseButton}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={ENHANCED_CATEGORIES}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.modalOption,
                  category === item.value && styles.modalOptionSelected,
                ]}
                onPress={() => {
                  setCategory(item.value);
                  setShowCategoryModal(false);
                }}
              >
                <View
                  style={[styles.modalIcon, { backgroundColor: item.color }]}
                >
                  <Text style={styles.modalIconText}>{item.icon}</Text>
                </View>
                <View style={styles.modalOptionContent}>
                  <Text style={styles.modalOptionLabel}>{item.label}</Text>
                  <Text style={styles.modalOptionDescription}>
                    {item.description}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Modal>

      {/* Priority Modal */}
      <Modal
        visible={showPriorityModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Priority</Text>
            <TouchableOpacity
              onPress={() => setShowPriorityModal(false)}
              style={styles.modalCloseButton}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={PRIORITY_LEVELS}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.modalOption,
                  priority === item.value && styles.modalOptionSelected,
                ]}
                onPress={() => {
                  setPriority(item.value);
                  setShowPriorityModal(false);
                }}
              >
                <View
                  style={[styles.modalIcon, { backgroundColor: item.color }]}
                >
                  <Text style={styles.modalIconText}>{item.icon}</Text>
                </View>
                <View style={styles.modalOptionContent}>
                  <Text style={styles.modalOptionLabel}>{item.label}</Text>
                  <Text style={styles.modalOptionDescription}>
                    {item.description}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Modal>

      {/* Barangay Modal */}
      <Modal
        visible={showBarangayModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Barangay</Text>
            <TouchableOpacity
              onPress={() => setShowBarangayModal(false)}
              style={styles.modalCloseButton}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            style={styles.modalContent}
            showsVerticalScrollIndicator={true}
          >
            {SURIGAO_BARANGAYS.map((barangay) => (
              <TouchableOpacity
                key={barangay.code}
                style={[
                  styles.modalOption,
                  selectedBarangay?.code === barangay.code &&
                    styles.modalOptionSelected,
                ]}
                onPress={() => {
                  setSelectedBarangay(barangay);
                  setShowBarangayModal(false);
                }}
              >
                <View style={styles.modalOptionContent}>
                  <Text style={styles.modalOptionIcon}>🏘️</Text>
                  <View style={styles.modalOptionText}>
                    <Text style={styles.modalOptionLabel}>{barangay.name}</Text>
                    <Text style={styles.modalOptionDescription}>
                      Code: {barangay.code}
                    </Text>
                  </View>
                </View>
                {selectedBarangay?.code === barangay.code && (
                  <Text style={styles.modalCheckmark}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Location Picker Modal */}
      {showLocationModal && (
        <Modal visible={showLocationModal} animationType="slide">
          <LocationPicker
            onLocationSelect={handleLocationSelect}
            initialLocation={locationData || undefined}
            onClose={() => setShowLocationModal(false)}
          />
        </Modal>
      )}

      {/* Alert */}
      <CustomAlert
        visible={showAlert}
        type={alertConfig.type as any}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={() => setShowAlert(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  compactPageHeader: {
    backgroundColor: "#F8FAFC",
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 4,
    textAlign: "center",
  },
  pageSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  modernForm: {
    padding: 20,
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  modernInputGroup: {
    marginBottom: 20,
  },
  inputHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  modernLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginRight: 4,
  },
  required: {
    color: Colors.error,
    fontSize: 16,
    fontWeight: "600",
  },
  modernInput: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.textPrimary,
    minHeight: 50,
  },
  modernTextArea: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.textPrimary,
    minHeight: 80,
    textAlignVertical: "top",
  },
  modernTextAreaLarge: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.textPrimary,
    minHeight: 120,
    textAlignVertical: "top",
  },
  modernCharCount: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: "right",
    marginTop: 4,
  },
  modernSelector: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 50,
  },
  modernSelectorSelected: {
    borderColor: Colors.primary,
    backgroundColor: "rgba(255, 138, 101, 0.05)",
  },
  modernSelectorEmpty: {
    borderColor: "#e9ecef",
    backgroundColor: "#f8f9fa",
  },
  placeholderText: {
    color: "#6c757d",
    fontStyle: "italic",
  },
  modernSelectedOption: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  modernSelectedIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  modernSelectedContent: {
    flex: 1,
  },
  modernSelectedLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  modernSelectedDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  modernPlaceholder: {
    fontSize: 15,
    color: "#9CA3AF",
  },
  modernArrow: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  locationButton: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  locationIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  locationContent: {
    flex: 1,
  },
  locationText: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  locationSubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  barangayDisplay: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  barangayName: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  barangayCode: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  modernCheckboxContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  modernCheckbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#E2E8F0",
    marginRight: 12,
    marginTop: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  modernCheckboxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  checkboxContent: {
    flex: 1,
  },
  modernCheckboxLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  modernCheckboxDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  disabledCheckboxContainer: {
    opacity: 0.6,
  },
  disabledCheckbox: {
    backgroundColor: "#F1F5F9",
    borderColor: "#CBD5E1",
  },
  disabledText: {
    color: Colors.textSecondary,
  },
  submitButton: {
    borderRadius: 16,
    paddingVertical: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: Platform.OS === "ios" ? 50 : 30,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCloseText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  modalOptionSelected: {
    backgroundColor: "rgba(255, 138, 101, 0.05)",
  },
  modalIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  modalIconText: {
    fontSize: 18,
    color: "#FFFFFF",
  },
  modalOptionContent: {
    flex: 1,
  },
  modalOptionLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  modalOptionDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalOptionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  modalOptionText: {
    flex: 1,
  },
  modalCheckmark: {
    fontSize: 18,
    color: Colors.primary,
    fontWeight: "bold",
  },
});
