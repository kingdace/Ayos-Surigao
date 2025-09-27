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

const ImageUploadFixed: React.FC<ImageUploadProps> = ({
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

    try {
      const asset = result.assets[0];
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        asset.uri,
        [{ resize: { width: 1920 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      return {
        uri: manipulatedImage.uri,
        width: manipulatedImage.width,
        height: manipulatedImage.height,
        fileSize: manipulatedImage.fileSize,
        fileName: `image_${Date.now()}.jpg`,
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
        style={styles.header}
        onPress={showImageOptions}
        disabled={loading || images.length >= maxImages}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{title}</Text>
          <Text style={styles.headerSubtitle}>
            {images.length}/{maxImages} photos
          </Text>
        </View>
        <View style={styles.addButton}>
          <Text style={styles.addButtonText}>
            {loading ? "..." : images.length >= maxImages ? "✓" : "+"}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Image Gallery */}
      {images.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.gallery}
          contentContainerStyle={styles.galleryContent}
        >
          {images.map((image, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image source={{ uri: image.uri }} style={styles.image} />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeImage(index)}
              >
                <Text style={styles.removeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            📸 Tap to add photos of the issue
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#495057",
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6c757d",
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  gallery: {
    marginTop: 12,
  },
  galleryContent: {
    paddingHorizontal: 4,
  },
  imageContainer: {
    position: "relative",
    marginRight: 12,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
  },
  removeButton: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#dc3545",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  removeButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    marginTop: 12,
  },
  emptyStateText: {
    fontSize: 14,
    color: "#6c757d",
    textAlign: "center",
  },
});

export default ImageUploadFixed;
