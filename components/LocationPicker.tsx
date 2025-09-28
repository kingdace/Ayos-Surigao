import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  Dimensions,
  TextInput,
} from "react-native";
import { MapView, Marker, Region } from "./MapComponents";
import * as Location from "expo-location";
import { Colors } from "../constants/Colors";

const { width, height } = Dimensions.get("window");

export interface LocationData {
  latitude: number;
  longitude: number;
  address?: string;
}

interface LocationPickerProps {
  onLocationSelect: (location: LocationData) => void;
  initialLocation?: LocationData;
  onClose: () => void;
}

// Surigao City bounds
const SURIGAO_BOUNDS = {
  latitude: 9.7894,
  longitude: 125.4947,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

const LocationPicker: React.FC<LocationPickerProps> = ({
  onLocationSelect,
  initialLocation,
  onClose,
}) => {
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(
    initialLocation || null
  );
  const [region, setRegion] = useState<any>(SURIGAO_BOUNDS);
  const [loading, setLoading] = useState(false);
  const [hasLocationPermission, setHasLocationPermission] = useState(false);

  useEffect(() => {
    // Start with default location immediately for better UX
    setDefaultLocation();
    // Then try to get user's location
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      // First check current permission status
      const currentPermission = await Location.getForegroundPermissionsAsync();
      console.log(
        "Current location permission status:",
        currentPermission.status
      );

      if (currentPermission.status === "granted") {
        console.log("Location permission already granted");
        setHasLocationPermission(true);
        getCurrentLocation();
        return;
      }

      // Request permission if not granted
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log("Location permission request result:", status);

      if (status === "granted") {
        console.log("Location permission granted after request");
        setHasLocationPermission(true);
        getCurrentLocation();
      } else {
        console.log("Location permission denied, using default location");
        setHasLocationPermission(false);
        setDefaultLocation();
      }
    } catch (error) {
      console.error("Error requesting location permission:", error);
      setHasLocationPermission(false);
      setDefaultLocation();
    }
  };

  const setDefaultLocation = () => {
    const defaultLocation = {
      latitude: SURIGAO_BOUNDS.latitude,
      longitude: SURIGAO_BOUNDS.longitude,
      address: "Surigao City Center (Default Location)",
    };

    setSelectedLocation(defaultLocation);
    setRegion({
      ...SURIGAO_BOUNDS,
      latitudeDelta: 0.05,
      longitudeDelta: 0.05,
    });
  };

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      console.log("Getting current location...");

      // Check permission status first
      const { status } = await Location.getForegroundPermissionsAsync();
      console.log("Permission status before getting location:", status);

      if (status !== "granted") {
        console.log("Location permission not granted, using default location");
        setDefaultLocation();
        return;
      }

      console.log("Requesting current position...");
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        mayShowUserSettingsDialog: true,
      });

      console.log("Got location:", location.coords);

      const currentLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      console.log("Current location coordinates:", currentLocation);

      // Always set the region to user's location first
      setRegion({
        ...currentLocation,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      // Check if current location is within Surigao City area
      if (
        isWithinSurigaoCity(currentLocation.latitude, currentLocation.longitude)
      ) {
        console.log("User is within Surigao City bounds");
        const address = await reverseGeocode(
          currentLocation.latitude,
          currentLocation.longitude
        );
        setSelectedLocation({
          ...currentLocation,
          address,
        });
      } else {
        console.log("User is outside Surigao City bounds");

        Alert.alert(
          "Location Notice",
          `You are currently outside Surigao City (${currentLocation.latitude.toFixed(
            4
          )}, ${currentLocation.longitude.toFixed(
            4
          )}). Please manually select a location within the city boundaries for your report.`,
          [
            {
              text: "Use Surigao City Center",
              onPress: () => setDefaultLocation(),
            },
            {
              text: "OK, I'll select manually",
              style: "cancel",
            },
          ]
        );
      }
    } catch (error) {
      console.error("Error getting current location:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.log("Error details:", errorMessage);

      Alert.alert(
        "Location Error",
        `Could not get your current location: ${errorMessage}. Please select a location manually on the map.`,
        [{ text: "OK" }]
      );

      setDefaultLocation();
    } finally {
      setLoading(false);
    }
  };

  const isWithinSurigaoCity = (
    latitude: number,
    longitude: number
  ): boolean => {
    return (
      latitude >= 9.72 &&
      latitude <= 9.85 &&
      longitude >= 125.43 &&
      longitude <= 125.55
    );
  };

  const reverseGeocode = async (
    latitude: number,
    longitude: number
  ): Promise<string> => {
    try {
      const result = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      if (result && result.length > 0) {
        const address = result[0];
        return `${address.street || ""} ${address.city || "Surigao City"}, ${
          address.region || "Surigao del Norte"
        }`.trim();
      }
    } catch (error) {
      console.error("Error reverse geocoding:", error);
    }
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  };

  const handleMapPress = async (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;

    if (!isWithinSurigaoCity(latitude, longitude)) {
      Alert.alert(
        "Location Outside City",
        "Please select a location within Surigao City boundaries.",
        [{ text: "OK" }]
      );
      return;
    }

    setLoading(true);
    try {
      const address = await reverseGeocode(latitude, longitude);
      const newLocation = { latitude, longitude, address };
      setSelectedLocation(newLocation);
    } catch (error) {
      console.error("Error setting location:", error);
      setSelectedLocation({ latitude, longitude });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmLocation = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
      onClose();
    } else {
      Alert.alert(
        "No Location Selected",
        "Please select a location on the map first."
      );
    }
  };

  const customMapStyle = [
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#a2daf2" }],
    },
    {
      featureType: "landscape.man_made",
      elementType: "geometry",
      stylers: [{ color: "#f7f1df" }],
    },
    {
      featureType: "landscape.natural",
      elementType: "geometry",
      stylers: [{ color: "#d0e3b4" }],
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Select Location</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Map */}
      {Platform.OS === "web" ? (
        // Web fallback - Manual coordinate input
        <View style={styles.webLocationContainer}>
          <Text style={styles.webLocationTitle}>📍 Select Location</Text>
          <Text style={styles.webLocationSubtitle}>
            Enter coordinates manually (web version)
          </Text>
          <View style={styles.webCoordinateInputs}>
            <View style={styles.webInputGroup}>
              <Text style={styles.webInputLabel}>Latitude:</Text>
              <TextInput
                style={styles.webCoordinateInput}
                value={selectedLocation?.latitude?.toString() || ""}
                onChangeText={(text) => {
                  const lat = parseFloat(text);
                  if (!isNaN(lat)) {
                    setSelectedLocation((prev) => ({
                      ...prev,
                      latitude: lat,
                      longitude: prev?.longitude || 0,
                    }));
                  }
                }}
                placeholder="9.7894"
                keyboardType="numeric"
              />
            </View>
            <View style={styles.webInputGroup}>
              <Text style={styles.webInputLabel}>Longitude:</Text>
              <TextInput
                style={styles.webCoordinateInput}
                value={selectedLocation?.longitude?.toString() || ""}
                onChangeText={(text) => {
                  const lng = parseFloat(text);
                  if (!isNaN(lng)) {
                    setSelectedLocation((prev) => ({
                      ...prev,
                      latitude: prev?.latitude || 0,
                      longitude: lng,
                    }));
                  }
                }}
                placeholder="125.4947"
                keyboardType="numeric"
              />
            </View>
          </View>
          <TouchableOpacity
            style={styles.webUseCurrentButton}
            onPress={getCurrentLocation}
          >
            <Text style={styles.webUseCurrentText}>
              📍 Use Current Location
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        // Native map view
        <MapView
          style={styles.map}
          region={region}
          onRegionChangeComplete={setRegion}
          onPress={handleMapPress}
          showsUserLocation={hasLocationPermission}
          showsMyLocationButton={hasLocationPermission}
          showsCompass={true}
          customMapStyle={customMapStyle}
          mapType="hybrid"
        >
          {selectedLocation && (
            <Marker
              coordinate={{
                latitude: selectedLocation.latitude,
                longitude: selectedLocation.longitude,
              }}
              title="Selected Location"
              description={selectedLocation.address || "Report location"}
              pinColor={Colors.primary}
            />
          )}
        </MapView>
      )}

      {/* Location Info */}
      {selectedLocation && (
        <View style={styles.locationInfo}>
          <Text style={styles.locationTitle}>📍 Selected Location</Text>
          <Text style={styles.coordinates}>
            {selectedLocation.latitude.toFixed(6)},{" "}
            {selectedLocation.longitude.toFixed(6)}
          </Text>
          {selectedLocation.address && (
            <Text style={styles.address}>{selectedLocation.address}</Text>
          )}
        </View>
      )}

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          📍 Tap anywhere on the map to select the exact location of the issue
        </Text>
        <Text style={styles.instructionSubtext}>
          {hasLocationPermission
            ? "Make sure the location is within Surigao City boundaries"
            : "Location permission denied - tap on the map or use the button to select a location"}
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[
            styles.currentLocationButton,
            loading && styles.buttonDisabled,
          ]}
          onPress={getCurrentLocation}
          disabled={loading}
        >
          <Text style={styles.currentLocationButtonText}>
            {loading
              ? "🔄 Getting Location..."
              : hasLocationPermission
              ? "📍 Get My Location"
              : "🏙️ Center on City"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.confirmButton,
            !selectedLocation && styles.confirmButtonDisabled,
          ]}
          onPress={handleConfirmLocation}
          disabled={!selectedLocation}
        >
          <Text
            style={[
              styles.confirmButtonText,
              !selectedLocation && styles.confirmButtonTextDisabled,
            ]}
          >
            Confirm Location
          </Text>
        </TouchableOpacity>
      </View>

      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>📍 Getting location...</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 60 : 30,
    backgroundColor: Colors.primary,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  map: {
    flex: 1,
  },
  locationInfo: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  coordinates: {
    fontSize: 14,
    color: "#6B7280",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  address: {
    fontSize: 14,
    color: Colors.textPrimary,
    marginTop: 4,
  },
  instructions: {
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  instructionText: {
    fontSize: 14,
    color: Colors.textPrimary,
    textAlign: "center",
    marginBottom: 4,
  },
  instructionSubtext: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
  },
  actionButtons: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  currentLocationButton: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 14,
    marginRight: 8,
    alignItems: "center",
  },
  currentLocationButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  confirmButton: {
    flex: 2,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 14,
    marginLeft: 8,
    alignItems: "center",
  },
  confirmButtonDisabled: {
    backgroundColor: "#D1D5DB",
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  confirmButtonTextDisabled: {
    color: "#9CA3AF",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  // Web-specific styles
  webLocationContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F8FAFC",
  },
  webLocationTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  webLocationSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  webCoordinateInputs: {
    gap: 16,
    marginBottom: 20,
  },
  webInputGroup: {
    gap: 8,
  },
  webInputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  webCoordinateInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  webUseCurrentButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  webUseCurrentText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
  },
});

export default LocationPicker;
