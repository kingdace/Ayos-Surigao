// Fix My Barangay - Color Palette
export const Colors = {
  // Main color palette
  primary: '#FF9B00',      // Vibrant Orange
  secondary: '#FFE100',    // Bright Yellow  
  tertiary: '#FFC900',     // Golden Yellow
  accent: '#EBE389',       // Light Yellow-Green

  // Text colors
  textPrimary: '#2C2C2C',    // Dark gray for main text
  textSecondary: '#5A5A5A',  // Medium gray for secondary text
  textMuted: '#8A8A8A',      // Light gray for muted text
  textLight: '#FFFFFF',      // White text

  // Background colors
  background: '#FFFFFF',      // Pure white
  backgroundLight: '#F8F9FA', // Very light gray
  backgroundDark: '#F0F0F0',  // Light gray

  // UI colors
  border: '#E0E0E0',         // Light border
  shadow: '#000000',         // Black for shadows
  overlay: 'rgba(0, 0, 0, 0.5)', // Semi-transparent overlay

  // Status colors
  success: '#28A745',        // Green for success
  error: '#DC3545',          // Red for errors
  warning: '#FFC107',        // Yellow for warnings
  info: '#17A2B8',           // Blue for info

  // Gradient Colors
  gradientPrimary: ['#FF9B00', '#FFC900'],     // Orange to Golden
  gradientSecondary: ['#FFE100', '#EBE389'],   // Yellow to Light Yellow
  gradientBackground: ['#FFF9F0', '#FEFEFE'], // Light background gradient
};

// Color utility functions
export const getTextColor = (backgroundColor: string): string => {
  // Return appropriate text color based on background
  const darkBackgrounds = [Colors.primary, Colors.tertiary];
  return darkBackgrounds.includes(backgroundColor) ? Colors.textLight : Colors.textPrimary;
};

export const getContrastColor = (color: string): string => {
  // Simple contrast color logic
  const lightColors = [Colors.secondary, Colors.accent, Colors.backgroundLight];
  return lightColors.includes(color) ? Colors.textPrimary : Colors.textLight;
};
