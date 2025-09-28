import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Dimensions,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";

import { MapView, Marker, Region } from '../../components/MapComponents';
import * as Location from "expo-location";
import { Colors } from "../../constants/Colors";
import {
  SimpleOperationsService,
  SimpleReport,
} from "../../lib/operations-service-simple";
import { mapService, ReportMapData } from "../../lib/map-service";
import { SURIGAO_CITY_BARANGAYS } from "../../database/surigao-barangays";

const { width, height } = Dimensions.get("window");

// Surigao City bounds
const SURIGAO_REGION: Region = {
  latitude: 9.7894,
  longitude: 125.4947,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

interface AdminMapScreenProps {
  onBack: () => void;
}

const AdminMapScreen: React.FC<AdminMapScreenProps> = ({ onBack }) => {
  const [reports, setReports] = useState<SimpleReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<SimpleReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<SimpleReport | null>(
    null
  );
  const [showFilters, setShowFilters] = useState(false);
  const [showReportDetails, setShowReportDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedBarangay, setSelectedBarangay] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const mapRef = useRef<MapView>(null);

  const operationsService = new SimpleOperationsService();

  useEffect(() => {
    loadReports();
    requestLocationPermission();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [reports, selectedCategory, selectedBarangay, searchQuery]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const { data, error } = await operationsService.getReports();
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

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    } catch (error) {
      console.error("Error getting location:", error);
    }
  };

  const applyFilters = () => {
    if (!reports || !Array.isArray(reports)) {
      setFilteredReports([]);
      return;
    }
    let filtered = [...reports];

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (report) =>
          report.category.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (selectedBarangay !== "all") {
      filtered = filtered.filter(
        (report) =>
          report.barangay_name?.toLowerCase() === selectedBarangay.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (report) =>
          report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          report.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredReports(filtered);
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

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "submitted":
        return "#F59E0B";
      case "in_progress":
        return "#3B82F6";
      case "resolved":
        return "#10B981";
      case "rejected":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const handleMarkerPress = (report: SimpleReport) => {
    setSelectedReport(report);
    setShowReportDetails(true);
  };

  const centerOnUserLocation = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000
      );
    }
  };

  const centerOnSurigao = () => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(SURIGAO_REGION, 1000);
    }
  };

  const renderMarker = (report: SimpleReport) => {
    const urgencyColor = getUrgencyColor(report.urgency);
    const statusColor = getStatusColor(report.status);

    return (
      <Marker
        key={report.id}
        coordinate={{
          latitude: report.latitude || 0,
          longitude: report.longitude || 0,
        }}
        onPress={() => handleMarkerPress(report)}
        anchor={{ x: 0.5, y: 0.5 }}
        centerOffset={{ x: 0, y: 0 }}
      >
        <View style={styles.markerWrapper}>
          <View
            style={[styles.markerContainer, { backgroundColor: urgencyColor }]}
          >
            <Text style={styles.markerIcon}>📍</Text>
          </View>
          <View
            style={[styles.statusIndicator, { backgroundColor: statusColor }]}
          />
        </View>
      </Marker>
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
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filterContent}>
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Category</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterScroll}
              >
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    selectedCategory === "all" && styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedCategory("all")}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedCategory === "all" && styles.filterChipTextActive,
                    ]}
                  >
                    All
                  </Text>
                </TouchableOpacity>
                {[
                  "Infrastructure",
                  "Environment",
                  "Safety",
                  "Health",
                  "Other",
                ].map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.filterChip,
                      selectedCategory === category && styles.filterChipActive,
                    ]}
                    onPress={() => setSelectedCategory(category)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        selectedCategory === category &&
                          styles.filterChipTextActive,
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Barangay</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterScroll}
              >
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    selectedBarangay === "all" && styles.filterChipActive,
                  ]}
                  onPress={() => setSelectedBarangay("all")}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedBarangay === "all" && styles.filterChipTextActive,
                    ]}
                  >
                    All
                  </Text>
                </TouchableOpacity>
                {SURIGAO_CITY_BARANGAYS.map((barangay) => (
                  <TouchableOpacity
                    key={barangay.code}
                    style={[
                      styles.filterChip,
                      selectedBarangay === barangay.name &&
                        styles.filterChipActive,
                    ]}
                    onPress={() => setSelectedBarangay(barangay.name)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        selectedBarangay === barangay.name &&
                          styles.filterChipTextActive,
                      ]}
                    >
                      {barangay.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.clearFiltersButton}
              onPress={() => {
                setSelectedCategory("all");
                setSelectedBarangay("all");
                setSearchQuery("");
              }}
            >
              <Text style={styles.clearFiltersText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyFiltersButton}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.applyFiltersText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderReportDetails = () => (
    <Modal
      visible={showReportDetails}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowReportDetails(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Report Details</Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowReportDetails(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {selectedReport && (
            <ScrollView style={styles.reportDetailsContent}>
              <Text style={styles.reportTitle}>{selectedReport.title}</Text>
              <Text style={styles.reportDescription}>
                {selectedReport.description}
              </Text>

              <View style={styles.reportMeta}>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Category:</Text>
                  <Text style={styles.metaValue}>
                    {selectedReport.category}
                  </Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Priority:</Text>
                  <View
                    style={[
                      styles.priorityBadge,
                      {
                        backgroundColor:
                          getUrgencyColor(selectedReport.urgency) + "20",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.priorityText,
                        { color: getUrgencyColor(selectedReport.urgency) },
                      ]}
                    >
                      {selectedReport.urgency?.toUpperCase()}
                    </Text>
                  </View>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Status:</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          getStatusColor(selectedReport.status) + "20",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(selectedReport.status) },
                      ]}
                    >
                      {selectedReport.status?.replace("_", " ").toUpperCase()}
                    </Text>
                  </View>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Location:</Text>
                  <Text style={styles.metaValue}>
                    {selectedReport.barangay_name || "Unknown Location"}
                  </Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Reporter:</Text>
                  <Text style={styles.metaValue}>
                    {selectedReport.reporter_name || "Anonymous"}
                  </Text>
                </View>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Submitted:</Text>
                  <Text style={styles.metaValue}>
                    {new Date(selectedReport.created_at).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {Platform.OS === 'web' ? (
        // Web fallback - List view instead of map
        <ScrollView style={styles.webListContainer}>
          <Text style={styles.webListTitle}>📍 Admin Reports ({filteredReports?.length || 0})</Text>
          {filteredReports && filteredReports.length > 0 ? (
            filteredReports.map((report) => (
              <TouchableOpacity
                key={report.id}
                style={styles.webReportCard}
                onPress={() => handleReportPress(report)}
              >
                <View style={styles.webReportHeader}>
                  <Text style={styles.webReportIcon}>
                    {getCategoryIcon(report.category)}
                  </Text>
                  <View style={styles.webReportInfo}>
                    <Text style={styles.webReportTitle}>{report.title}</Text>
                    <Text style={styles.webReportLocation}>
                      📍 {report.barangay_name || 'Unknown Location'}
                    </Text>
                  </View>
                  <View style={[
                    styles.webReportStatus,
                    { backgroundColor: getMarkerColor(report) }
                  ]}>
                    <Text style={styles.webReportStatusText}>
                      {getStatusIcon(report.status)} {report.status}
                    </Text>
                  </View>
                </View>
                <Text style={styles.webReportDescription} numberOfLines={2}>
                  {report.description}
                </Text>
                <Text style={styles.webReportCoords}>
                  📍 {report.latitude?.toFixed(4)}, {report.longitude?.toFixed(4)}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.webEmptyState}>
              <Text style={styles.webEmptyText}>No reports found</Text>
              <Text style={styles.webEmptySubtext}>Try adjusting your filters</Text>
            </View>
          )}
        </ScrollView>
      ) : (
        // Native map view
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={SURIGAO_REGION}
          showsUserLocation={true}
          showsMyLocationButton={false}
        >
          {filteredReports &&
            filteredReports.length > 0 &&
            filteredReports.map((report) => renderMarker(report))}
        </MapView>
      )}

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search reports..."
          placeholderTextColor={Colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Text style={styles.filterButtonText}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Control Buttons */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={centerOnSurigao}
        >
          <Text style={styles.controlButtonText}>🏙️</Text>
        </TouchableOpacity>
        {userLocation && (
          <TouchableOpacity
            style={styles.controlButton}
            onPress={centerOnUserLocation}
          >
            <Text style={styles.controlButtonText}>📍</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Report Count */}
      <View style={styles.reportCountContainer}>
        <Text style={styles.reportCountText}>
          {filteredReports ? filteredReports.length : 0} reports found
        </Text>
      </View>

      {renderFilters()}
      {renderReportDetails()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.backgroundLight,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  searchContainer: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.textPrimary,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterButton: {
    marginLeft: 10,
    backgroundColor: Colors.primary,
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterButtonText: {
    fontSize: 20,
    color: Colors.textLight,
  },
  controlsContainer: {
    position: "absolute",
    right: 20,
    bottom: 120,
    alignItems: "center",
  },
  controlButton: {
    backgroundColor: Colors.background,
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  controlButtonText: {
    fontSize: 20,
  },
  reportCountContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    backgroundColor: Colors.background,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportCountText: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: "600",
  },
  markerWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  markerIcon: {
    fontSize: 20,
    color: Colors.textLight,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 2,
    borderWidth: 2,
    borderColor: Colors.background,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
    backgroundColor: Colors.backgroundLight,
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
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  filterScroll: {
    flexDirection: "row",
  },
  filterChip: {
    backgroundColor: Colors.backgroundLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
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
    color: Colors.textLight,
    fontWeight: "600",
  },
  modalFooter: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  clearFiltersButton: {
    flex: 1,
    backgroundColor: Colors.backgroundLight,
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
    color: Colors.textLight,
    fontWeight: "600",
  },
  reportDetailsContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  reportTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  reportDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: 16,
  },
  reportMeta: {
    gap: 12,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  metaLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  metaValue: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: "600",
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: "600",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  // Web-specific styles
  webListContainer: {
    flex: 1,
    padding: 16,
  },
  webListTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  webReportCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  webReportHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  webReportIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  webReportInfo: {
    flex: 1,
  },
  webReportTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  webReportLocation: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  webReportStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  webReportStatusText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  webReportDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  webReportCoords: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: "monospace",
  },
  webEmptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  webEmptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  webEmptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});

export default AdminMapScreen;
