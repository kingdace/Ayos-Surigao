// Fix My Barangay - Map Integration Service
// Handles location services and map functionality

export interface MapLocation {
  latitude: number;
  longitude: number;
  address?: string;
  barangay?: string;
}

export interface ReportMapData {
  id: string;
  title: string;
  category: string;
  status: string;
  urgency: string;
  latitude: number;
  longitude: number;
  barangay_name?: string;
  created_at: string;
}

// Surigao City bounds and center
export const SURIGAO_CITY_BOUNDS = {
  center: {
    latitude: 9.7894,
    longitude: 125.4947,
  },
  north: 9.85,
  south: 9.72,
  east: 125.55,
  west: 125.43,
};

export class MapService {
  /**
   * Get current device location
   */
  async getCurrentLocation(): Promise<MapLocation | null> {
    try {
      // For now, return Surigao City center
      // In a real implementation, you would use:
      // - expo-location for getting actual GPS coordinates
      // - expo-location for reverse geocoding to get address

      return {
        latitude: SURIGAO_CITY_BOUNDS.center.latitude,
        longitude: SURIGAO_CITY_BOUNDS.center.longitude,
        address: "Surigao City Center",
        barangay: "Poblacion",
      };
    } catch (error) {
      console.error("Error getting current location:", error);
      return null;
    }
  }

  /**
   * Reverse geocode coordinates to get address
   */
  async reverseGeocode(latitude: number, longitude: number): Promise<string> {
    try {
      // Mock reverse geocoding for now
      // In a real implementation, you would use a geocoding service

      if (this.isWithinSurigaoCity(latitude, longitude)) {
        return `Location in Surigao City (${latitude.toFixed(
          4
        )}, ${longitude.toFixed(4)})`;
      } else {
        return `Location outside Surigao City (${latitude.toFixed(
          4
        )}, ${longitude.toFixed(4)})`;
      }
    } catch (error) {
      console.error("Error reverse geocoding:", error);
      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    }
  }

  /**
   * Check if coordinates are within Surigao City bounds
   */
  isWithinSurigaoCity(latitude: number, longitude: number): boolean {
    return (
      latitude >= SURIGAO_CITY_BOUNDS.south &&
      latitude <= SURIGAO_CITY_BOUNDS.north &&
      longitude >= SURIGAO_CITY_BOUNDS.west &&
      longitude <= SURIGAO_CITY_BOUNDS.east
    );
  }

  /**
   * Calculate distance between two points (in kilometers)
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Get map markers for reports
   */
  getReportMarkers(reports: ReportMapData[]): Array<{
    id: string;
    coordinate: { latitude: number; longitude: number };
    title: string;
    description: string;
    color: string;
    icon: string;
  }> {
    return reports.map((report) => ({
      id: report.id,
      coordinate: {
        latitude: report.latitude,
        longitude: report.longitude,
      },
      title: report.title,
      description: `${report.category} • ${report.status} • ${
        report.barangay_name || "Unknown Area"
      }`,
      color: this.getMarkerColor(report.status, report.urgency),
      icon: this.getCategoryIcon(report.category),
    }));
  }

  /**
   * Get marker color based on status and urgency
   */
  private getMarkerColor(status: string, urgency: string): string {
    if (status === "resolved" || status === "verified" || status === "closed") {
      return "#10B981"; // Green for completed
    }

    switch (urgency) {
      case "critical":
        return "#DC2626"; // Red
      case "high":
        return "#EF4444"; // Orange-red
      case "medium":
        return "#F59E0B"; // Orange
      case "low":
        return "#3B82F6"; // Blue
      default:
        return "#6B7280"; // Gray
    }
  }

  /**
   * Get category icon for map markers
   */
  private getCategoryIcon(category: string): string {
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
  }

  /**
   * Generate directions URL to a location
   */
  getDirectionsUrl(latitude: number, longitude: number): string {
    const coords = `${latitude},${longitude}`;

    // Return Google Maps directions URL
    return `https://www.google.com/maps/dir/?api=1&destination=${coords}`;
  }

  /**
   * Get barangay boundaries (mock data for now)
   */
  getBarangayBoundaries(): Array<{
    name: string;
    code: string;
    coordinates: Array<{ latitude: number; longitude: number }>;
  }> {
    // In a real implementation, this would return actual barangay boundary polygons
    return [
      {
        name: "Poblacion",
        code: "POBLACION",
        coordinates: [
          { latitude: 9.785, longitude: 125.49 },
          { latitude: 9.79, longitude: 125.49 },
          { latitude: 9.79, longitude: 125.5 },
          { latitude: 9.785, longitude: 125.5 },
        ],
      },
      // Add more barangay boundaries as needed
    ];
  }
}

// Export singleton instance
export const mapService = new MapService();
