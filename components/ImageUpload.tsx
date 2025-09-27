import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  Dimensions,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { Colors } from "../constants/Colors";

const { width } = Dimensions.get("window");

export interface ImageData {
  uri: string;
  width: number;
  height: number;
  fileSize?: number;
  fileName?: string;
}

interface ImageUploadProps {
  images: ImageData[];
  onImagesChange: (images: ImageData[]) => void;
  maxImages?: number;
  title?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  images,
  onImagesChange,
  maxImages = 3,
  title = "Attach Photos",
}) => {
  const [loading, setLoading] = useState(false);

  const requestPermissions = async () => {
    try {
      const { status: cameraStatus } =
        await ImagePicker.requestCameraPermissionsAsync();
      const { status: galleryStatus } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (cameraStatus !== "granted" || galleryStatus !== "granted") {
        Alert.alert(
          "Permissions Required",
          "Please grant camera and photo library permissions to upload images.",
          [{ text: "OK" }]
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error requesting permissions:", error);
      Alert.alert(
        "Permission Error",
        "Unable to request camera permissions. Please check your app settings.",
        [{ text: "OK" }]
      );
      return false;
    }
  };

  const processImage = async (
    result: ImagePicker.ImagePickerResult
  ): Promise<ImageData | null> => {
    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];

    try {
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        asset.uri,
        [{ resize: { width: Math.min(asset.width || 1920, 1920) } }],
        {
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );

      return {
        uri: manipulatedImage.uri,
        width: manipulatedImage.width,
        height: manipulatedImage.height,
        fileSize: asset.fileSize,
        fileName: asset.fileName || `image_${Date.now()}.jpg`,
      };
    } catch (error) {
      console.error("Error processing image:", error);
      Alert.alert("Error", "Failed to process image. Please try again.");
      return null;
    }
  };

  const takePicture = async () => {
    if (images.length >= maxImages) {
      Alert.alert(
        "Limit Reached",
        `You can only upload up to ${maxImages} images.`
      );
      return;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setLoading(true);
    try {
      // Use the most reliable approach - no mediaTypes parameter
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      const processedImage = await processImage(result);
      if (processedImage) {
        onImagesChange([...images, processedImage]);
      }
    } catch (error) {
      console.error("Error taking picture:", error);
      Alert.alert(
        "Camera Error",
        `Unable to access camera: ${error.message}. Please make sure the camera permission is granted and try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  const pickFromGallery = async () => {
    if (images.length >= maxImages) {
      Alert.alert(
        "Limit Reached",
        `You can only upload up to ${maxImages} images.`
      );
      return;
    }

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    setLoading(true);
    try {
      // Use the most reliable approach - no mediaTypes parameter
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      const processedImage = await processImage(result);
      if (processedImage) {
        onImagesChange([...images, processedImage]);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert(
        "Gallery Error",
        "Unable to access photo library. Please make sure the photo library permission is granted and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const removeImage = (index: number) => {
    Alert.alert("Remove Image", "Are you sure you want to remove this image?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          const newImages = images.filter((_, i) => i !== index);
          onImagesChange(newImages);
        },
      },
    ]);
  };

  const showImageOptions = () => {
    Alert.alert("Add Photo", "How would you like to add a photo?", [
      { text: "Cancel", style: "cancel" },
      { text: "📷 Take Photo", onPress: takePicture },
      { text: "🖼️ Choose from Gallery", onPress: pickFromGallery },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Modern Compact Header */}
      <TouchableOpacity
        style={styles.headerButton}
        onPress={showImageOptions}
        disabled={loading || images.length >= maxImages}
      >
        <View style={styles.headerContent}>
          <View style={styles.leftContent}>
            <Text style={styles.icon}>📷</Text>
            <View style={styles.textContent}>
              <Text style={styles.title}>
                {images.length > 0
                  ? `${images.length} Photo${
                      images.length > 1 ? "s" : ""
                    } Added`
                  : title}
              </Text>
              <Text style={styles.subtitle}>
                {loading
                  ? "Processing..."
                  : images.length >= maxImages
                  ? "Maximum photos reached"
                  : images.length > 0
                  ? "Tap to add more"
                  : "Optional: Add evidence photos"}
              </Text>
            </View>
          </View>
          {images.length < maxImages && !loading && (
            <Text style={styles.arrow}>+</Text>
          )}
        </View>
      </TouchableOpacity>

      {/* Images Preview */}
      {images.length > 0 && (
        <View style={styles.imagesPreview}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.imagesScrollContainer}
          >
            {images.map((image, index) => (
              <View key={index} style={styles.imageWrapper}>
                <Image
                  source={{ uri: image.uri }}
                  style={styles.previewImage}
                />
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeImage(index)}
                >
                  <Text style={styles.removeText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  headerButton: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  icon: {
    fontSize: 20,
    marginRight: 12,
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  arrow: {
    fontSize: 18,
    color: Colors.primary,
    fontWeight: "600",
  },
  imagesPreview: {
    marginTop: 12,
    paddingLeft: 16,
  },
  imagesScrollContainer: {
    paddingRight: 16,
  },
  imageWrapper: {
    position: "relative",
    marginRight: 12,
  },
  previewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: Colors.lightGray,
  },
  removeButton: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    backgroundColor: Colors.error,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  removeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
});

export default ImageUpload;
