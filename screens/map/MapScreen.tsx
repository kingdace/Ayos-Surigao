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
import { SURIGAO_BARANGAYS } from "../../database/surigao-barangays";

const { width, height } = Dimensions.get("window");

// Surigao City bounds
const SURIGAO_REGION: Region = {
  latitude: 9.7894,
  longitude: 125.4947,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

interface MapScreenProps {
  // Add any props if needed
}

const MapScreen: React.FC<MapScreenProps> = () => {
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

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [selectedBarangay, setSelectedBarangay] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const mapRef = useRef<MapView>(null);
  const operationsService = new SimpleOperationsService();

  // Filter options
  const categoryFilters = [
    { value: "all", label: "All Categories", icon: "📋" },
    { value: "broken_lights", label: "Street Lights", icon: "💡" },
    { value: "trash_collection", label: "Waste Management", icon: "🗑️" },
    { value: "water_issues", label: "Water Systems", icon: "💧" },
    { value: "road_damage", label: "Road Infrastructure", icon: "🛣️" },
    { value: "drainage", label: "Drainage & Flooding", icon: "🌊" },
    { value: "noise_complaint", label: "Noise Issues", icon: "🔊" },
    { value: "public_safety", label: "Public Safety", icon: "🚨" },
    { value: "other", label: "Other Issues", icon: "📝" },
  ];

  const statusFilters = [
    { value: "all", label: "All Status", color: "#6B7280" },
    { value: "pending", label: "Pending", color: "#F59E0B" },
    { value: "in_progress", label: "In Progress", color: "#3B82F6" },
    { value: "resolved", label: "Resolved", color: "#10B981" },
    { value: "closed", label: "Closed", color: "#6B7280" },
  ];

  const priorityFilters = [
    { value: "all", label: "All Priorities", color: "#6B7280" },
    { value: "critical", label: "Critical", color: "#DC2626" },
    { value: "high", label: "High", color: "#EF4444" },
    { value: "medium", label: "Medium", color: "#F59E0B" },
    { value: "low", label: "Low", color: "#10B981" },
  ];

  useEffect(() => {
    loadReports();
    getCurrentLocation();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [
    reports,
    selectedCategory,
    selectedStatus,
    selectedPriority,
    selectedBarangay,
    searchQuery,
  ]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const { data, error } = await operationsService.getReports();

      if (error) {
        console.error("Error loading reports:", error);
        Alert.alert("Error", "Failed to load reports");
        return;
      }

      if (data) {
        // Filter reports that have location data
        const reportsWithLocation = data.filter(
          (report) => report.latitude && report.longitude
        );
        setReports(reportsWithLocation);
      }
    } catch (error) {
      console.error("Error loading reports:", error);
      Alert.alert("Error", "Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("Location permission denied");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error("Error getting location:", error);
    }
  };

  const applyFilters = () => {
    let filtered = [...reports];

    // Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (report) => report.category === selectedCategory
      );
    }

    // Apply status filter
    if (selectedStatus !== "all") {
      filtered = filtered.filter((report) => report.status === selectedStatus);
    }

    // Apply priority filter
    if (selectedPriority !== "all") {
      filtered = filtered.filter(
        (report) => report.urgency === selectedPriority
      );
    }

    // Apply barangay filter
    if (selectedBarangay !== "all") {
      filtered = filtered.filter(
        (report) => report.barangay_code === selectedBarangay
      );
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (report) =>
          report.title.toLowerCase().includes(query) ||
          report.description.toLowerCase().includes(query) ||
          (report.barangay_name &&
            report.barangay_name.toLowerCase().includes(query)) ||
          (report.specific_location &&
            report.specific_location.toLowerCase().includes(query))
      );
    }

    setFilteredReports(filtered);
  };

  const handleMarkerPress = (report: SimpleReport) => {
    setSelectedReport(report);
    setShowReportDetails(true);
  };

  const handleCloseReportDetails = () => {
    setShowReportDetails(false);
    setSelectedReport(null);
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

  const centerOnSurigaoCity = () => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(SURIGAO_REGION, 1000);
    }
  };

  const getMarkerColor = (report: SimpleReport) => {
    if (report.status === "resolved" || report.status === "closed") {
      return "#059669"; // Darker green for completed
    }

    switch (report.urgency) {
      case "critical":
        return "#B91C1C"; // Darker red
      case "high":
        return "#DC2626"; // Red
      case "medium":
        return "#D97706"; // Darker orange
      case "low":
        return "#2563EB"; // Darker blue
      default:
        return "#4B5563"; // Darker gray
    }
  };

  const getCategoryIcon = (category: string) => {
    const iconMap: { [key: string]: string } = {
      broken_lights: "💡",
      trash_collection: "🗑️",
      water_issues: "💧",
      road_damage: "🛣️",
      drainage: "🌊",
      public_safety: "🚨",
      noise_complaint: "🔊",
      other: "📝",
    };
    return iconMap[category] || "📍";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
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

  const clearFilters = () => {
    setSelectedCategory("all");
    setSelectedStatus("all");
    setSelectedPriority("all");
    setSelectedBarangay("all");
    setSearchQuery("");
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (selectedCategory !== "all") count++;
    if (selectedStatus !== "all") count++;
    if (selectedPriority !== "all") count++;
    if (selectedBarangay !== "all") count++;
    if (searchQuery.trim()) count++;
    return count;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>🗺️ Community Map</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setShowFilters(true)}
            >
              <Text style={styles.headerButtonText}>
                🔍{" "}
                {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={loadReports}>
              <Text style={styles.headerButtonText}>🔄</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search reports or locations..."
            placeholderTextColor={Colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Map View */}
      <View style={styles.mapContainer}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading reports...</Text>
          </View>
        ) : Platform.OS === 'web' ? (
          // Web fallback - List view instead of map
          <ScrollView style={styles.webListContainer}>
            <Text style={styles.webListTitle}>📍 Community Reports ({filteredReports.length})</Text>
            {filteredReports.map((report) => (
              <TouchableOpacity
                key={report.id}
                style={styles.webReportCard}
                onPress={() => handleMarkerPress(report)}
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
            ))}
            {filteredReports.length === 0 && (
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
            showsCompass={true}
            showsScale={true}
          >
            {/* Report Markers */}
            {filteredReports.map((report) => (
              <Marker
                key={report.id}
                coordinate={{
                  latitude: report.latitude!,
                  longitude: report.longitude!,
                }}
                title={report.title}
                description={`${report.category} • ${report.status}`}
                onPress={() => handleMarkerPress(report)}
                anchor={{ x: 0.5, y: 0.5 }}
                centerOffset={{ x: 0, y: 0 }}
              >
                <View style={styles.markerWrapper}>
                  <View
                    style={[
                      styles.markerContainer,
                      { backgroundColor: getMarkerColor(report) },
                    ]}
                  >
                    <Text style={styles.markerIcon}>
                      {getCategoryIcon(report.category)}
                    </Text>
                  </View>
                </View>
              </Marker>
            ))}
          </MapView>
        )}

        {/* Map Controls */}
        <View style={styles.mapControls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={centerOnUserLocation}
          >
            <Text style={styles.controlButtonText}>📍</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={centerOnSurigaoCity}
          >
            <Text style={styles.controlButtonText}>🏙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Info Bar */}
      <View style={styles.bottomInfo}>
        <Text style={styles.bottomInfoText}>
          {filteredReports.length} reports • {reports.length} total
        </Text>
        {getActiveFiltersCount() > 0 && (
          <TouchableOpacity
            onPress={clearFilters}
            style={styles.clearFiltersButton}
          >
            <Text style={styles.clearFiltersText}>Clear Filters</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  // Header
  header: {
    backgroundColor: "#FFFFFF",
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 12,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  headerButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
  },
  headerButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  searchContainer: {
    marginTop: 0,
  },
  searchInput: {
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  // Map
  mapContainer: {
    flex: 1,
    position: "relative",
  },
  map: {
    width: "100%",
    height: "100%",
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
  // Markers
  markerWrapper: {
    alignItems: "center",
    justifyContent: "center",
    width: 40,
    height: 40,
  },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 8,
  },
  markerIcon: {
    fontSize: 18,
    textAlign: "center",
    fontWeight: "700",
    lineHeight: 18,
  },
  // Map Controls
  mapControls: {
    position: "absolute",
    right: 16,
    top: 16,
    gap: 8,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  controlButtonText: {
    fontSize: 20,
  },
  // Bottom Info
  bottomInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  bottomInfoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "500",
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

export default MapScreen;
