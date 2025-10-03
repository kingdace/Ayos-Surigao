import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
  ActivityIndicator,
  Platform,
  ScrollView,
  Dimensions,
  Modal,
} from "react-native";
import { Colors } from "../../constants/Colors";
import {
  simpleOperationsService,
  SimpleReport,
} from "../../lib/operations-service-simple";
import ReportDetailModal from "./ReportDetailModal";
import { useAuth } from "../../contexts/AuthContext";

// Filter options
const CATEGORY_FILTERS = [
  { value: "all", label: "All Categories" },
  { value: "broken_lights", label: "Street Lights" },
  { value: "trash_collection", label: "Waste Management" },
  { value: "water_issues", label: "Water Systems" },
  { value: "road_damage", label: "Road Infrastructure" },
  { value: "drainage", label: "Drainage & Flooding" },
  { value: "noise_complaint", label: "Noise Issues" },
  { value: "public_safety", label: "Public Safety" },
  { value: "other", label: "Other Issues" },
];

const BARANGAY_FILTERS = [
  { value: "all", label: "All Barangays" },
  { value: "POBLACION", label: "Poblacion" },
  { value: "SAN_JUAN", label: "San Juan" },
  { value: "RIZAL", label: "Rizal" },
  { value: "LUNA", label: "Luna" },
  { value: "MABINI", label: "Mabini" },
  { value: "MAPAWA", label: "Mapawa" },
  { value: "ALANG_ALANG", label: "Alang-Alang" },
  { value: "ANOMAR", label: "Anomar" },
  { value: "BILABID", label: "Bilabid" },
  { value: "BONIFACIO", label: "Bonifacio" },
  { value: "CAGUTIAN", label: "Cagutian" },
  { value: "CANLANIPA", label: "Canlanipa" },
  { value: "CANTILAN", label: "Cantilan" },
  { value: "CAPALAYAN", label: "Capalayan" },
  { value: "CARAS-AN", label: "Caras-an" },
  { value: "CARMEN", label: "Carmen" },
  { value: "DAGANAS", label: "Daganas" },
  { value: "DALIPDIP", label: "Dalipdip" },
  { value: "DANAO", label: "Danao" },
  { value: "DAY-ASAN", label: "Day-asan" },
  { value: "GABUAN", label: "Gabuan" },
  { value: "GAMUT", label: "Gamut" },
  { value: "HONRADO", label: "Honrado" },
  { value: "IBUAN", label: "Ibuang" },
  { value: "IPIL", label: "Ipil" },
  { value: "JAGNA", label: "Jagna" },
  { value: "KATIPUNAN", label: "Katipunan" },
  { value: "LIPATA", label: "Lipata" },
  { value: "MAGSAYSAY", label: "Magsaysay" },
  { value: "MANIHAG", label: "Manihag" },
  { value: "MATI", label: "Mati" },
  { value: "NONOC", label: "Nonoc" },
  { value: "PAG-ASA", label: "Pag-asa" },
  { value: "PAGBILAO", label: "Pagbilao" },
  { value: "PALO", label: "Palo" },
  { value: "PAMOSINGAN", label: "Pamosingan" },
  { value: "PANGABLAN", label: "Pangablan" },
  { value: "PUNTA", label: "Punta" },
  { value: "QUEZON", label: "Quezon" },
  { value: "SABANG", label: "Sabang" },
  { value: "SALVACION", label: "Salvacion" },
  { value: "SANTA_CRUZ", label: "Santa Cruz" },
  { value: "SAPAO", label: "Sapao" },
  { value: "SIDLAKAN", label: "Sidlakan" },
  { value: "SILOP", label: "Silop" },
  { value: "SUGBAY", label: "Sugbay" },
  { value: "SUGBAYON", label: "Sugbayon" },
  { value: "TALISAY", label: "Talisay" },
  { value: "TANGCAL", label: "Tangcal" },
  { value: "TIGAO", label: "Tigao" },
  { value: "TUBOD", label: "Tubod" },
  { value: "UBAY", label: "Ubay" },
  { value: "VILLARICA", label: "Villarica" },
  { value: "WASHINGTON", label: "Washington" },
];

const { width } = Dimensions.get("window");

interface ReportsListScreenProps {
  initialTab?: "all" | "my";
}

const ReportsListScreenEnhanced = ({
  initialTab = "all",
}: ReportsListScreenProps) => {
  const { user } = useAuth();
  const styles = createStyles(!user);
  const [reports, setReports] = useState<SimpleReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<SimpleReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedReport, setSelectedReport] = useState<SimpleReport | null>(
    null
  );
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBarangay, setSelectedBarangay] = useState("all");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showBarangayDropdown, setShowBarangayDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "my">(
    user ? initialTab : "all" // Force "all" tab for guests
  );

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [reports, selectedCategory, selectedBarangay, activeTab, user]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const { data, error } = await simpleOperationsService.getReports({
        limit: 50,
        offset: 0,
      });

      if (data && !error) {
        setReports(data);
      } else {
        console.error("Error loading reports:", error);
      }
    } catch (error) {
      console.error("Error loading reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...reports];

    // Filter by tab (all vs my reports)
    if (activeTab === "my" && user) {
      filtered = filtered.filter((report) => report.user_id === user.id);
    }

    // Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (report) => report.category === selectedCategory
      );
    }

    // Apply barangay filter
    if (selectedBarangay !== "all") {
      filtered = filtered.filter(
        (report) => report.barangay_code === selectedBarangay
      );
    }

    setFilteredReports(filtered);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadReports();
    setRefreshing(false);
  };

  const handleReportPress = (report: SimpleReport) => {
    setSelectedReport(report);
    setShowDetailModal(true);
  };

  const handleCloseModal = () => {
    setShowDetailModal(false);
    setSelectedReport(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    // For very recent posts (less than 1 hour)
    if (diffInMinutes < 60) {
      if (diffInMinutes < 1) {
        return "Just now";
      }
      return `${diffInMinutes}m ago`;
    }
    // For today (less than 24 hours)
    else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }
    // For yesterday
    else if (diffInDays === 1) {
      return "Yesterday";
    }
    // For this week (less than 7 days)
    else if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    }
    // For older posts, show actual date
    else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: diffInDays > 365 ? "numeric" : undefined,
      });
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "#F59E0B";
      case "in_progress":
        return "#3B82F6";
      case "resolved":
        return "#10B981";
      case "closed":
        return "#6B7280";
      default:
        return Colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "⏳";
      case "in_progress":
        return "🔄";
      case "resolved":
        return "✅";
      case "closed":
        return "🔒";
      default:
        return "📝";
    }
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
      default:
        return "Other";
    }
  };

  const getLocationDisplay = (report: SimpleReport) => {
    // Try different location sources in order of preference
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

  const getReporterDisplay = (report: SimpleReport) => {
    if (report.is_anonymous) {
      return "Anonymous";
    }
    // Use the actual reporter name from the database
    if (report.reporter_name && report.reporter_name.trim()) {
      return report.reporter_name;
    }
    return "Community Member";
  };

  const getPriorityColor = (urgency?: string) => {
    switch (urgency?.toLowerCase()) {
      case "high":
        return "#EF4444";
      case "medium":
        return "#F59E0B";
      case "low":
        return "#10B981";
      default:
        return "#6B7280";
    }
  };

  const getPriorityIcon = (urgency?: string) => {
    switch (urgency?.toLowerCase()) {
      case "high":
        return "🔴";
      case "medium":
        return "🟡";
      case "low":
        return "🟢";
      default:
        return "⚪";
    }
  };

  const renderReportItem = ({ item }: { item: SimpleReport }) => {
    const dateTime = formatDateTime(item.created_at);

    return (
      <TouchableOpacity
        style={styles.reportCard}
        onPress={() => handleReportPress(item)}
        activeOpacity={0.7}
      >
        {/* Top Row: Title & Status */}
        <View style={styles.cardTopRow}>
          <Text style={styles.reportTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(item.status) },
              ]}
            >
              <Text style={styles.statusText}>
                {item.status.replace("_", " ").toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Second Row: Category & User Info */}
        <View style={styles.cardSecondRow}>
          <View style={styles.categoryContainer}>
            <Text style={styles.categoryIcon}>
              {getCategoryIcon(item.category)}
            </Text>
            <Text style={styles.categoryLabel}>
              {getCategoryLabel(item.category)}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {item.reporter_name || "Community Member"}
            </Text>
          </View>
        </View>

        {/* Middle Row: Location & Photos */}
        <View style={styles.cardMiddleRow}>
          <View style={styles.locationInfo}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationText} numberOfLines={1}>
              {getLocationDisplay(item)}
            </Text>
          </View>
          {item.photo_urls && item.photo_urls.length > 0 && (
            <View style={styles.photoInfo}>
              <Text style={styles.photoIcon}>📷</Text>
              <Text style={styles.photoCount}>{item.photo_urls.length}</Text>
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
      </TouchableOpacity>
    );
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
      {/* Compact Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Community Reports</Text>
            <Text style={styles.headerSubtitle}>
              {activeTab === "my" ? "My " : ""}
              {filteredReports.length}{" "}
              {filteredReports.length === 1 ? "report" : "reports"}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowFilterModal(true)}
            >
              <Text style={styles.actionIcon}>🔍</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleRefresh}
            >
              <Text style={styles.actionIcon}>🔄</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "all" && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab("all")}
        >
          <Text
            style={[
              styles.tabButtonText,
              activeTab === "all" && styles.tabButtonTextActive,
            ]}
          >
            All Reports
          </Text>
        </TouchableOpacity>
        {user && (
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "my" && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab("my")}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === "my" && styles.tabButtonTextActive,
              ]}
            >
              My Reports
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Status */}
      {(selectedCategory !== "all" || selectedBarangay !== "all") && (
        <View style={styles.filterStatus}>
          <Text style={styles.filterStatusText}>
            Showing {filteredReports.length} report
            {filteredReports.length !== 1 ? "s" : ""}
            {selectedCategory !== "all" &&
              ` • ${
                CATEGORY_FILTERS.find((f) => f.value === selectedCategory)
                  ?.label
              }`}
            {selectedBarangay !== "all" &&
              ` • ${
                BARANGAY_FILTERS.find((f) => f.value === selectedBarangay)
                  ?.label
              }`}
          </Text>
          <TouchableOpacity
            style={styles.clearFiltersButton}
            onPress={() => {
              setSelectedCategory("all");
              setSelectedBarangay("all");
            }}
          >
            <Text style={styles.clearFiltersText}>Clear</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Reports List */}
      {reports.length > 0 ? (
        <FlatList
          data={filteredReports}
          keyExtractor={(item) => item.id}
          renderItem={renderReportItem}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[Colors.primary]}
            />
          }
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>
            {activeTab === "my" ? "📋" : "📝"}
          </Text>
          <Text style={styles.emptyTitle}>
            {activeTab === "my" ? "No Reports Yet" : "No Reports Yet"}
          </Text>
          <Text style={styles.emptyText}>
            {activeTab === "my"
              ? "You haven't submitted any reports yet.\nGo to the Create tab to submit your first report!"
              : "Be the first to report a community issue!\nGo to the Create tab to submit a report."}
          </Text>
        </View>
      )}

      {/* Report Detail Modal */}
      <ReportDetailModal
        visible={showDetailModal}
        report={selectedReport}
        onClose={handleCloseModal}
      />

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.filterModal}>
            <View style={styles.filterHeader}>
              <Text style={styles.filterTitle}>Filter Reports</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowFilterModal(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filterContent}>
              {/* Category Dropdown */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Category</Text>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => {
                    setShowCategoryDropdown(!showCategoryDropdown);
                    setShowBarangayDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownButtonText}>
                    {CATEGORY_FILTERS.find((f) => f.value === selectedCategory)
                      ?.label || "Select Category"}
                  </Text>
                  <Text style={styles.dropdownArrow}>
                    {showCategoryDropdown ? "▲" : "▼"}
                  </Text>
                </TouchableOpacity>

                {showCategoryDropdown && (
                  <View style={styles.dropdownList}>
                    <ScrollView
                      style={styles.dropdownScrollView}
                      showsVerticalScrollIndicator={true}
                      nestedScrollEnabled={true}
                    >
                      {CATEGORY_FILTERS.map((filter) => (
                        <TouchableOpacity
                          key={filter.value}
                          style={[
                            styles.dropdownItem,
                            selectedCategory === filter.value &&
                              styles.dropdownItemSelected,
                          ]}
                          onPress={() => {
                            setSelectedCategory(filter.value);
                            setShowCategoryDropdown(false);
                          }}
                        >
                          <Text
                            style={[
                              styles.dropdownItemText,
                              selectedCategory === filter.value &&
                                styles.dropdownItemTextSelected,
                            ]}
                          >
                            {filter.label}
                          </Text>
                          {selectedCategory === filter.value && (
                            <Text style={styles.checkmark}>✓</Text>
                          )}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>

              {/* Barangay Dropdown */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Barangay</Text>
                <TouchableOpacity
                  style={styles.dropdownButton}
                  onPress={() => {
                    setShowBarangayDropdown(!showBarangayDropdown);
                    setShowCategoryDropdown(false);
                  }}
                >
                  <Text style={styles.dropdownButtonText}>
                    {BARANGAY_FILTERS.find((f) => f.value === selectedBarangay)
                      ?.label || "Select Barangay"}
                  </Text>
                  <Text style={styles.dropdownArrow}>
                    {showBarangayDropdown ? "▲" : "▼"}
                  </Text>
                </TouchableOpacity>

                {showBarangayDropdown && (
                  <View style={styles.dropdownList}>
                    <ScrollView
                      style={styles.dropdownScrollView}
                      showsVerticalScrollIndicator={true}
                      nestedScrollEnabled={true}
                    >
                      {BARANGAY_FILTERS.map((filter) => (
                        <TouchableOpacity
                          key={filter.value}
                          style={[
                            styles.dropdownItem,
                            selectedBarangay === filter.value &&
                              styles.dropdownItemSelected,
                          ]}
                          onPress={() => {
                            setSelectedBarangay(filter.value);
                            setShowBarangayDropdown(false);
                          }}
                        >
                          <Text
                            style={[
                              styles.dropdownItemText,
                              selectedBarangay === filter.value &&
                                styles.dropdownItemTextSelected,
                            ]}
                          >
                            {filter.label}
                          </Text>
                          {selectedBarangay === filter.value && (
                            <Text style={styles.checkmark}>✓</Text>
                          )}
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            </ScrollView>

            <View style={styles.filterFooter}>
              <TouchableOpacity
                style={styles.clearAllButton}
                onPress={() => {
                  setSelectedCategory("all");
                  setSelectedBarangay("all");
                }}
              >
                <Text style={styles.clearAllButtonText}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => setShowFilterModal(false)}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const createStyles = (isGuest: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#F8FAFC",
    },
    header: {
      backgroundColor: "#FFFFFF",
      paddingTop:
        Platform.OS === "ios" ? (isGuest ? 40 : 50) : isGuest ? 15 : 20,
      paddingBottom: isGuest ? 8 : 12,
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
    // Tab Bar Styles
    tabBar: {
      flexDirection: "row",
      backgroundColor: "#FFFFFF",
      marginHorizontal: 16,
      marginTop: 8,
      borderRadius: 12,
      padding: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    tabButton: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: "center",
    },
    tabButtonActive: {
      backgroundColor: Colors.primary,
    },
    tabButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: Colors.textSecondary,
    },
    tabButtonTextActive: {
      color: "#FFFFFF",
    },
    headerTitle: {
      fontSize: isGuest ? 20 : 24,
      fontWeight: "700",
      color: Colors.textPrimary,
      marginBottom: 2,
    },
    headerSubtitle: {
      fontSize: 14,
      color: Colors.textSecondary,
    },
    headerActions: {
      flexDirection: "row",
      gap: 8,
    },
    actionButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: "#F1F5F9",
      alignItems: "center",
      justifyContent: "center",
    },
    actionIcon: {
      fontSize: 16,
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
    listContainer: {
      paddingTop: 8,
      paddingBottom: Platform.OS === "android" ? 80 : 100,
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
    reportHeader: {
      marginBottom: 12,
    },
    reportTitleRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 8,
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
    statusIcon: {
      fontSize: 16,
      marginRight: 6,
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
    // New card layout styles
    reportTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: Colors.textPrimary,
      lineHeight: 24,
      flex: 1,
      marginRight: 12,
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
    reportMetaRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    reportNumber: {
      fontSize: 12,
      color: Colors.textSecondary,
      fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
      fontWeight: "500",
    },
    priorityContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    priorityIcon: {
      fontSize: 12,
      marginRight: 4,
    },
    priorityText: {
      fontSize: 11,
      fontWeight: "600",
    },
    reportDescription: {
      fontSize: 14,
      color: Colors.textSecondary,
      lineHeight: 20,
      marginBottom: 12,
    },
    photoSection: {
      marginBottom: 12,
    },
    reporterInfo: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
      paddingVertical: 8,
      paddingHorizontal: 12,
      backgroundColor: "#F8FAFC",
      borderRadius: 8,
    },
    reporterIcon: {
      fontSize: 14,
      marginRight: 6,
    },
    reporterText: {
      fontSize: 13,
      color: Colors.textSecondary,
      fontWeight: "500",
    },
    photoThumbnail: {
      width: 50,
      height: 50,
      borderRadius: 8,
      marginRight: 8,
      backgroundColor: "#F1F5F9",
    },
    morePhotos: {
      width: 50,
      height: 50,
      borderRadius: 8,
      backgroundColor: "#F1F5F9",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#E2E8F0",
    },
    morePhotosText: {
      fontSize: 11,
      fontWeight: "600",
      color: Colors.textSecondary,
    },
    reportFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    footerRight: {
      alignItems: "flex-end",
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
    reportDate: {
      fontSize: 12,
      color: Colors.textSecondary,
      fontWeight: "500",
    },
    emptyState: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 32,
    },
    emptyIcon: {
      fontSize: 64,
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: "600",
      color: Colors.textPrimary,
      marginBottom: 8,
    },
    emptyText: {
      fontSize: 14,
      color: Colors.textSecondary,
      textAlign: "center",
      lineHeight: 20,
    },
    // Filter Status
    filterStatus: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: "#F1F5F9",
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginHorizontal: 16,
      borderRadius: 8,
      marginBottom: 8,
    },
    filterStatusText: {
      fontSize: 14,
      color: Colors.textSecondary,
      flex: 1,
    },
    clearFiltersButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: Colors.primary,
      borderRadius: 6,
    },
    clearFiltersText: {
      fontSize: 12,
      color: "#FFFFFF",
      fontWeight: "600",
    },
    // Filter Modal
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "flex-end",
    },
    filterModal: {
      backgroundColor: "#FFFFFF",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: "80%",
      minHeight: "50%",
    },
    filterHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: "#F1F5F9",
    },
    filterTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: Colors.textPrimary,
    },
    closeButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: "#F1F5F9",
      justifyContent: "center",
      alignItems: "center",
    },
    closeButtonText: {
      fontSize: 16,
      color: Colors.textSecondary,
      fontWeight: "600",
    },
    filterContent: {
      flex: 1,
      paddingHorizontal: 20,
    },
    filterSection: {
      marginVertical: 16,
    },
    filterSectionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: Colors.textPrimary,
      marginBottom: 12,
    },
    // Dropdown Styles
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
    filterFooter: {
      flexDirection: "row",
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderTopWidth: 1,
      borderTopColor: "#F1F5F9",
      gap: 12,
    },
    clearAllButton: {
      flex: 1,
      paddingVertical: 12,
      backgroundColor: "#F8FAFC",
      borderRadius: 8,
      alignItems: "center",
      borderWidth: 1,
      borderColor: "#E2E8F0",
    },
    clearAllButtonText: {
      fontSize: 16,
      color: Colors.textSecondary,
      fontWeight: "600",
    },
    applyButton: {
      flex: 1,
      paddingVertical: 12,
      backgroundColor: Colors.primary,
      borderRadius: 8,
      alignItems: "center",
    },
    applyButtonText: {
      fontSize: 16,
      color: "#FFFFFF",
      fontWeight: "600",
    },
  });

// Styles will be created inside the component

export default ReportsListScreenEnhanced;
