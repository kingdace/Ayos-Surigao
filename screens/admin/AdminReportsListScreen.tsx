import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";
import { Colors } from "../../constants/Colors";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import {
  adminService,
  AdminReport,
  ReportFilters,
} from "../../lib/admin-service";
import AdminReportDetailModal from "./AdminReportDetailModal";

const { width } = Dimensions.get("window");

interface AdminReportsListScreenProps {
  onBack: () => void;
}

const AdminReportsListScreen: React.FC<AdminReportsListScreenProps> = ({
  onBack,
}) => {
  const { admin } = useAdminAuth();
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<AdminReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedReport, setSelectedReport] = useState<AdminReport | null>(
    null
  );
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<{
    status: boolean;
    category: boolean;
    urgency: boolean;
    barangay: boolean;
  }>({
    status: false,
    category: false,
    urgency: false,
    barangay: false,
  });

  // Filter states
  const [filters, setFilters] = useState<ReportFilters>({
    status: "",
    category: "",
    urgency: "",
    barangay_code: "",
  });

  // Status options
  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "submitted", label: "Submitted" },
    { value: "reviewing", label: "Reviewing" },
    { value: "assigned", label: "Assigned" },
    { value: "in_progress", label: "In Progress" },
    { value: "resolved", label: "Resolved" },
    { value: "closed", label: "Closed" },
    { value: "rejected", label: "Rejected" },
  ];

  // Category options
  const categoryOptions = [
    { value: "", label: "All Categories" },
    { value: "roads_infrastructure", label: "Roads & Infrastructure" },
    { value: "utilities_power", label: "Utilities & Power" },
    { value: "water_sanitation", label: "Water & Sanitation" },
    { value: "waste_management", label: "Waste Management" },
    { value: "public_safety", label: "Public Safety" },
    { value: "streetlights", label: "Streetlights" },
    { value: "drainage_flooding", label: "Drainage & Flooding" },
    { value: "public_facilities", label: "Public Facilities" },
    { value: "environmental", label: "Environmental" },
    { value: "other", label: "Other" },
  ];

  // Urgency options
  const urgencyOptions = [
    { value: "", label: "All Urgency" },
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" },
  ];

  // Barangay options with actual Surigao City barangay names from the project
  const barangayOptions = [
    { value: "", label: "All Barangays" },
    { value: "ALANG_ALANG", label: "Alang-alang" },
    { value: "ANOMAR", label: "Anomar" },
    { value: "AURORA", label: "Aurora" },
    { value: "BILABID", label: "Bilabid" },
    { value: "BONIFACIO", label: "Bonifacio" },
    { value: "BUGSUKAN", label: "Bugsukan" },
    { value: "BUENAVISTA", label: "Buenavista" },
    { value: "CANLANIPA", label: "Canlanipa" },
    { value: "CAPALAYAN", label: "Capalayan" },
    { value: "DANAWAN", label: "Danawan" },
    { value: "HABAY", label: "Habay" },
    { value: "IPIL", label: "Ipil" },
    { value: "JUBGAN", label: "Jubgan" },
    { value: "LIPATA", label: "Lipata" },
    { value: "LUNA", label: "Luna" },
    { value: "MABINI", label: "Mabini" },
    { value: "MABUA", label: "Mabua" },
    { value: "MAG_ASO", label: "Mag-aso" },
    { value: "MAPAWA", label: "Mapawa" },
    { value: "MATALINGAO", label: "Matalingao" },
    { value: "NONOC", label: "Nonoc" },
    { value: "OROK", label: "Orok" },
    { value: "POBLACION", label: "Poblacion" },
    { value: "POCTOY", label: "Poctoy" },
    { value: "QUEZON", label: "Quezon" },
    { value: "RIZAL", label: "Rizal" },
    { value: "SABANG", label: "Sabang" },
    { value: "SACA", label: "Saca" },
    { value: "SAN_JUAN", label: "San Juan" },
    { value: "SAN_MATEO", label: "San Mateo" },
    { value: "SAN_PEDRO", label: "San Pedro" },
    { value: "SILOP", label: "Silop" },
    { value: "SUKAILANG", label: "Sukailang" },
    { value: "TAGANA_AN", label: "Tagana-an" },
    { value: "TAFT", label: "Taft" },
    { value: "TOGBONGON", label: "Togbongon" },
    { value: "TRINIDAD", label: "Trinidad" },
    { value: "WASHINGTON", label: "Washington" },
  ];

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [reports, searchQuery, filters]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const { data, error } = await adminService.getReports(filters);
      if (error) {
        console.error("Error loading reports:", error);
        Alert.alert("Error", "Failed to load reports");
      } else {
        setReports(data || []);
      }
    } catch (error) {
      console.error("Error loading reports:", error);
      Alert.alert("Error", "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  };

  const applyFilters = () => {
    let filtered = [...reports];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (report) =>
          report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          report.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          report.barangay_name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    setFilteredReports(filtered);
  };

  const handleStatusUpdate = async (reportId: string, newStatus: string) => {
    try {
      console.log(`Updating report ${reportId} to status: ${newStatus}`);

      const { success, error } = await adminService.updateReportStatus(
        reportId,
        newStatus,
        `Status updated to ${newStatus} by ${admin?.first_name} ${admin?.last_name}`
      );

      if (success) {
        Alert.alert("Success", "Report status updated successfully");
        // Refresh the list to show updated status
        await loadReports();
      } else {
        console.error("Status update error:", error);
        Alert.alert("Error", error || "Failed to update report status");
      }
    } catch (error) {
      console.error("Error updating report status:", error);
      Alert.alert(
        "Error",
        `Failed to update report status: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "#F59E0B";
      case "in_progress":
        return "#3B82F6";
      case "resolved":
        return "#10B981";
      case "closed":
        return "#6B7280";
      case "submitted":
        return "#F59E0B";
      case "reviewing":
        return "#3B82F6";
      case "assigned":
        return "#8B5CF6";
      case "rejected":
        return "#EF4444";
      default:
        return Colors.textSecondary;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency?.toLowerCase()) {
      case "critical":
        return "#EF4444";
      case "high":
        return "#F59E0B";
      case "medium":
        return "#3B82F6";
      case "low":
        return "#10B981";
      default:
        return "#6B7280";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "broken_lights":
        return "💡";
      case "trash_collection":
        return "🗑️";
      case "water_issues":
        return "💧";
      case "road_damage":
        return "🛣️";
      case "drainage":
        return "🌊";
      case "noise_complaints":
        return "🔊";
      case "public_safety":
        return "🚨";
      case "illegal_activities":
        return "⚠️";
      case "roads_infrastructure":
        return "🛣️";
      case "utilities_power":
        return "⚡";
      case "water_sanitation":
        return "💧";
      case "waste_management":
        return "🗑️";
      case "streetlights":
        return "💡";
      case "drainage_flooding":
        return "🌊";
      case "public_facilities":
        return "🏛️";
      case "environmental":
        return "🌱";
      case "other":
        return "⚠️";
      default:
        return "📝";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "broken_lights":
        return "Street Lights";
      case "trash_collection":
        return "Waste Management";
      case "water_issues":
        return "Water Systems";
      case "road_damage":
        return "Road Infrastructure";
      case "drainage":
        return "Drainage & Flooding";
      case "noise_complaints":
        return "Noise Issues";
      case "public_safety":
        return "Public Safety";
      case "illegal_activities":
        return "Illegal Activities";
      case "roads_infrastructure":
        return "Roads & Infrastructure";
      case "utilities_power":
        return "Utilities & Power";
      case "water_sanitation":
        return "Water & Sanitation";
      case "waste_management":
        return "Waste Management";
      case "streetlights":
        return "Streetlights";
      case "drainage_flooding":
        return "Drainage & Flooding";
      case "public_facilities":
        return "Public Facilities";
      case "environmental":
        return "Environmental";
      case "other":
        return "Other Issues";
      default:
        return "Other";
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year:
          date.getFullYear() !== new Date().getFullYear()
            ? "numeric"
            : undefined,
      }),
      time: date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }),
    };
  };

  const getLocationDisplay = (report: AdminReport) => {
    if (report.barangay_name && report.barangay_name !== "Unknown") {
      return report.barangay_name;
    }
    if (report.specific_location && report.specific_location.trim()) {
      return report.specific_location;
    }
    if (report.barangay_code) {
      return `Barangay ${report.barangay_code}`;
    }
    return "Location not specified";
  };

  const getReporterDisplay = (report: AdminReport) => {
    if (report.is_anonymous) {
      return "Anonymous";
    }
    if (report.reporter_name && report.reporter_name.trim()) {
      return report.reporter_name;
    }
    if (report.reporter_contact && report.reporter_contact.trim()) {
      return report.reporter_contact;
    }
    if (report.user_id) {
      return "Registered User";
    }
    return "Community Member";
  };

  const toggleDropdown = (type: keyof typeof dropdownOpen) => {
    // Close all other dropdowns first
    setDropdownOpen((prev) => {
      const newState = {
        status: false,
        category: false,
        urgency: false,
        barangay: false,
      };
      newState[type] = !prev[type];
      return newState;
    });
  };

  const renderDropdown = (
    type: keyof typeof dropdownOpen,
    options: { value: string; label: string }[],
    currentValue: string,
    onSelect: (value: string) => void
  ) => {
    const isOpen = dropdownOpen[type];
    const selectedOption = options.find((opt) => opt.value === currentValue);

    return (
      <View style={styles.dropdownContainer}>
        <TouchableOpacity
          style={styles.dropdownButton}
          onPress={() => toggleDropdown(type)}
        >
          <Text style={styles.dropdownButtonText}>
            {selectedOption ? selectedOption.label : `Select ${type}`}
          </Text>
          <Text style={styles.dropdownArrow}>{isOpen ? "▲" : "▼"}</Text>
        </TouchableOpacity>

        {isOpen && (
          <View style={styles.dropdownList}>
            <ScrollView
              style={styles.dropdownScrollView}
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={true}
              bounces={false}
            >
              {options.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.dropdownItem,
                    currentValue === option.value &&
                      styles.dropdownItemSelected,
                  ]}
                  onPress={() => {
                    onSelect(option.value);
                    toggleDropdown(type);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      currentValue === option.value &&
                        styles.dropdownItemTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                  {currentValue === option.value && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    );
  };

  const closeAllDropdowns = () => {
    setDropdownOpen({
      status: false,
      category: false,
      urgency: false,
      barangay: false,
    });
  };

  const renderReportCard = ({ item: report }: { item: AdminReport }) => {
    const dateTime = formatDateTime(report.created_at);

    return (
      <TouchableOpacity
        style={styles.reportCard}
        onPress={() => {
          setSelectedReport(report);
          setShowDetailModal(true);
        }}
        activeOpacity={0.7}
      >
        {/* Top Row: Title & Status */}
        <View style={styles.cardTopRow}>
          <Text style={styles.reportTitle} numberOfLines={2}>
            {report.title}
          </Text>
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(report.status) },
              ]}
            >
              <Text style={styles.statusText}>
                {report.status.replace("_", " ").toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Second Row: Category & User Info */}
        <View style={styles.cardSecondRow}>
          <View style={styles.categoryContainer}>
            <Text style={styles.categoryIcon}>
              {getCategoryIcon(report.category)}
            </Text>
            <Text style={styles.categoryLabel}>
              {getCategoryLabel(report.category)}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{getReporterDisplay(report)}</Text>
          </View>
        </View>

        {/* Middle Row: Location & Photos */}
        <View style={styles.cardMiddleRow}>
          <View style={styles.locationInfo}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationText} numberOfLines={1}>
              {getLocationDisplay(report)}
            </Text>
          </View>
          {report.photo_urls && report.photo_urls.length > 0 && (
            <View style={styles.photoInfo}>
              <Text style={styles.photoIcon}>📷</Text>
              <Text style={styles.photoCount}>{report.photo_urls.length}</Text>
            </View>
          )}
        </View>

        {/* Bottom Row: Date & Time */}
        <View style={styles.cardBottomRow}>
          <View style={styles.dateTimeContainer}>
            <Text style={styles.dateText}>{dateTime.date}</Text>
            <Text style={styles.timeText}>{dateTime.time}</Text>
          </View>
          <View style={styles.tapIndicator}>
            <Text style={styles.tapIndicatorText}>Tap to view details →</Text>
          </View>
        </View>

        {/* Assignment Info - Only show if assigned */}
        {report.assigned_admin && (
          <View style={styles.assignmentInfo}>
            <Text style={styles.assignedText}>
              👤 Assigned to: {report.assigned_admin.first_name}{" "}
              {report.assigned_admin.last_name}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderFilters = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Reports</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setShowFilters(false);
                closeAllDropdowns();
              }}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filterContent}>
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Status</Text>
              {renderDropdown(
                "status",
                statusOptions,
                filters.status || "",
                (value) => setFilters({ ...filters, status: value })
              )}
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Category</Text>
              {renderDropdown(
                "category",
                categoryOptions,
                filters.category || "",
                (value) => setFilters({ ...filters, category: value })
              )}
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Urgency</Text>
              {renderDropdown(
                "urgency",
                urgencyOptions,
                filters.urgency || "",
                (value) => setFilters({ ...filters, urgency: value })
              )}
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Barangay</Text>
              {renderDropdown(
                "barangay",
                barangayOptions,
                filters.barangay_code || "",
                (value) => setFilters({ ...filters, barangay_code: value })
              )}
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.clearFiltersButton}
              onPress={() => {
                setFilters({
                  status: "",
                  category: "",
                  urgency: "",
                  barangay_code: "",
                });
                setSearchQuery("");
              }}
            >
              <Text style={styles.clearFiltersText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyFiltersButton}
              onPress={() => {
                setShowFilters(false);
                loadReports();
                closeAllDropdowns();
              }}
            >
              <Text style={styles.applyFiltersText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const handleReportPress = (report: AdminReport) => {
    setSelectedReport(report);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedReport(null);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading reports...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Reports Management</Text>
            <Text style={styles.headerSubtitle}>
              {filteredReports.length} reports found
            </Text>
          </View>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
          >
            <Text style={styles.filterButtonText}>🔍 Filter</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search reports..."
          placeholderTextColor={Colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Stats Summary */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{filteredReports.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, styles.pendingNumber]}>
            {
              filteredReports.filter(
                (r) => r.status === "submitted" || r.status === "pending"
              ).length
            }
          </Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, styles.progressNumber]}>
            {
              filteredReports.filter(
                (r) => r.status === "in_progress" || r.status === "reviewing"
              ).length
            }
          </Text>
          <Text style={styles.statLabel}>In Progress</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, styles.resolvedNumber]}>
            {filteredReports.filter((r) => r.status === "resolved").length}
          </Text>
          <Text style={styles.statLabel}>Resolved</Text>
        </View>
      </View>

      {/* Reports List */}
      <FlatList
        data={filteredReports}
        renderItem={renderReportCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No reports found</Text>
            <Text style={styles.emptyStateSubtext}>
              Try adjusting your search or filters
            </Text>
          </View>
        }
      />

      {renderFilters()}
      <AdminReportDetailModal
        visible={showDetailModal}
        report={selectedReport}
        onClose={handleCloseModal}
        onStatusUpdate={handleStatusUpdate}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  header: {
    backgroundColor: "#FFFFFF",
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 6,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 1,
  },
  headerSubtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  filterButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  filterButtonText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    marginTop: 5,
  },
  searchInput: {
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    justifyContent: "space-between",
  },
  statCard: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderRadius: 6,
    padding: 6,
    marginHorizontal: 1,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    minHeight: 50,
    marginTop: -5,
    marginBottom: 3,
  },
  statNumber: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.primary,
    marginBottom: 1,
  },
  statLabel: {
    fontSize: 8,
    color: Colors.textSecondary,
    fontWeight: "600",
    textAlign: "center",
  },
  pendingNumber: {
    color: "#F59E0B",
  },
  progressNumber: {
    color: "#3B82F6",
  },
  resolvedNumber: {
    color: "#10B981",
  },
  listContainer: {
    paddingTop: 8,
    paddingBottom: 16,
  },
  reportCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  cardSecondRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardMiddleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  categoryContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  categoryLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  userName: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.textSecondary,
    fontStyle: "italic",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
    lineHeight: 24,
    flex: 1,
    marginRight: 12,
  },
  locationInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },
  locationIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  locationText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  photoInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  photoIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  photoCount: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  dateTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginRight: 8,
  },
  timeText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  tapIndicator: {
    flexDirection: "row",
    alignItems: "center",
  },
  tapIndicatorText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: "500",
  },
  assignmentInfo: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  assignedText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  filterContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  filterSection: {
    marginBottom: 20,
    zIndex: 1,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  filterChip: {
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  filterChipTextActive: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  // Dropdown styles
  dropdownContainer: {
    marginBottom: 8,
  },
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: "500",
    flex: 1,
  },
  dropdownArrow: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  dropdownList: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    marginBottom: 8,
    maxHeight: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownScrollView: {
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  dropdownItemSelected: {
    backgroundColor: "#F0F9FF",
  },
  dropdownItemText: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: "500",
    flex: 1,
  },
  dropdownItemTextSelected: {
    color: Colors.primary,
    fontWeight: "600",
  },
  checkmark: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: "bold",
  },
  modalFooter: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  clearFiltersButton: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 8,
  },
  clearFiltersText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  applyFiltersButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginLeft: 8,
  },
  applyFiltersText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
  },
});

export default AdminReportsListScreen;
