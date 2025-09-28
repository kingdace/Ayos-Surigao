import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  Platform,
  Alert,
} from "react-native";
import { Colors } from "../../constants/Colors";
import { AdminReport } from "../../lib/admin-service";

const { width, height } = Dimensions.get("window");

interface AdminReportDetailModalProps {
  visible: boolean;
  report: AdminReport | null;
  onClose: () => void;
  onStatusUpdate: (reportId: string, newStatus: string) => void;
}

const AdminReportDetailModal: React.FC<AdminReportDetailModalProps> = ({
  visible,
  report,
  onClose,
  onStatusUpdate,
}) => {
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!report) return null;

  const formatFullDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
      case "submitted":
        return "#F59E0B";
      case "reviewing":
        return "#3B82F6";
      case "assigned":
        return "#8B5CF6";
      case "in_progress":
        return "#06B6D4";
      case "resolved":
        return "#10B981";
      case "closed":
        return "#6B7280";
      case "rejected":
        return "#EF4444";
      default:
        return Colors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
      case "submitted":
        return "📝";
      case "reviewing":
        return "👀";
      case "assigned":
        return "👤";
      case "in_progress":
        return "🔄";
      case "resolved":
        return "✅";
      case "closed":
        return "🔒";
      case "rejected":
        return "❎";
      default:
        return "📝";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "roads_infrastructure":
        return "🛣️";
      case "utilities_power":
        return "⚡";
      case "water_sanitation":
        return "💧";
      case "waste_management":
        return "🗑️";
      case "public_safety":
        return "🚨";
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
      case "roads_infrastructure":
        return "Roads & Infrastructure";
      case "utilities_power":
        return "Utilities & Power";
      case "water_sanitation":
        return "Water & Sanitation";
      case "waste_management":
        return "Waste Management";
      case "public_safety":
        return "Public Safety";
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

  const getPriorityColor = (urgency?: string) => {
    switch (urgency?.toLowerCase()) {
      case "critical":
        return "#DC2626";
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
      case "critical":
        return "🚨";
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
    return "Community Member";
  };

  const handleStatusUpdate = (newStatus: string) => {
    Alert.alert(
      "Update Status",
      `Are you sure you want to change the status to "${newStatus
        .replace("_", " ")
        .toUpperCase()}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Update",
          onPress: () => {
            onStatusUpdate(report.id, newStatus);
            onClose();
          },
        },
      ]
    );
  };

  const handleImagePress = (index: number) => {
    setSelectedImageIndex(index);
    setShowImagePreview(true);
  };

  const handleCloseImagePreview = () => {
    setShowImagePreview(false);
  };

  const handleNextImage = () => {
    if (
      report?.photo_urls &&
      selectedImageIndex < report.photo_urls.length - 1
    ) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
  };

  const handlePrevImage = () => {
    if (selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Gradient Header */}
        <View style={styles.header}>
          <View style={styles.headerGradient}>
            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <Text style={styles.headerTitle}>📋 Admin Report Details</Text>
                <Text style={styles.reportNumber}>#{report.id.slice(-8)}</Text>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Hero Section with Title and Status */}
          <View style={styles.heroSection}>
            <View style={styles.titleContainer}>
              <View style={styles.titleRow}>
                <Text style={styles.title}>{report.title}</Text>
                <View style={styles.statusContainer}>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(report.status) },
                    ]}
                  >
                    <Text style={styles.statusIcon}>
                      {getStatusIcon(report.status)}
                    </Text>
                    <Text style={styles.statusText}>
                      {report.status.replace("_", " ").toUpperCase()}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Category & Priority Cards */}
          <View style={styles.metaCards}>
            <View style={[styles.metaCard, styles.categoryCard]}>
              <View style={styles.metaCardHeader}>
                <Text style={styles.metaCardIcon}>
                  {getCategoryIcon(report.category)}
                </Text>
                <Text style={styles.metaCardTitle}>Category</Text>
              </View>
              <Text style={styles.metaCardValue}>
                {getCategoryLabel(report.category)}
              </Text>
            </View>

            {report.urgency && (
              <View style={[styles.metaCard, styles.priorityCard]}>
                <View style={styles.metaCardHeader}>
                  <Text style={styles.metaCardIcon}>
                    {getPriorityIcon(report.urgency)}
                  </Text>
                  <Text style={styles.metaCardTitle}>Priority</Text>
                </View>
                <Text
                  style={[
                    styles.metaCardValue,
                    { color: getPriorityColor(report.urgency) },
                  ]}
                >
                  {report.urgency.toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          {/* Description Card */}
          <View style={styles.descriptionCard}>
            <View style={styles.descriptionHeader}>
              <Text style={styles.descriptionIcon}>📝</Text>
              <Text style={styles.descriptionTitle}>Description</Text>
            </View>
            <Text style={styles.description}>{report.description}</Text>
          </View>

          {/* Location & Reporter Cards */}
          <View style={styles.infoCards}>
            <View style={[styles.infoCard, styles.locationCard]}>
              <View style={styles.infoCardHeader}>
                <Text style={styles.infoCardIcon}>📍</Text>
                <Text style={styles.infoCardTitle}>Location</Text>
              </View>
              <Text style={styles.locationText}>
                {getLocationDisplay(report)}
              </Text>
              {report.specific_location && (
                <Text style={styles.specificLocation}>
                  {report.specific_location}
                </Text>
              )}
            </View>

            <View style={[styles.infoCard, styles.reporterCard]}>
              <View style={styles.infoCardHeader}>
                <Text style={styles.infoCardIcon}>👤</Text>
                <Text style={styles.infoCardTitle}>Reporter</Text>
              </View>
              <Text style={styles.reporterName}>
                {getReporterDisplay(report)}
              </Text>
              <Text style={styles.reportDate}>
                {formatFullDate(report.created_at)}
              </Text>
            </View>
          </View>

          {/* Assignment Info */}
          {report.assigned_admin && (
            <View style={styles.assignmentCard}>
              <View style={styles.assignmentHeader}>
                <Text style={styles.assignmentIcon}>👤</Text>
                <Text style={styles.assignmentTitle}>Assignment</Text>
              </View>
              <Text style={styles.assignedAdmin}>
                {report.assigned_admin.first_name}{" "}
                {report.assigned_admin.last_name}
              </Text>
              <Text style={styles.assignedEmail}>
                {report.assigned_admin.email}
              </Text>
            </View>
          )}

          {/* Photos Section */}
          {report.photo_urls && report.photo_urls.length > 0 && (
            <View style={styles.photosCard}>
              <View style={styles.photosHeader}>
                <Text style={styles.photosIcon}>📸</Text>
                <Text style={styles.photosTitle}>
                  Photos ({report.photo_urls.length})
                </Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.photosContainer}
              >
                {report.photo_urls.map((photoUrl, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.photoWrapper}
                    onPress={() => handleImagePress(index)}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={{ uri: photoUrl }}
                      style={styles.photo}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Admin Comments Section */}
          {report.admin_comments && report.admin_comments.length > 0 && (
            <View style={styles.commentsCard}>
              <View style={styles.commentsHeader}>
                <Text style={styles.commentsIcon}>💬</Text>
                <Text style={styles.commentsTitle}>
                  Admin Comments ({report.admin_comments.length})
                </Text>
              </View>
              {report.admin_comments.map((comment, index) => (
                <View key={index} style={styles.commentItem}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentAuthor}>
                      {comment.admin.first_name} {comment.admin.last_name}
                    </Text>
                    <Text style={styles.commentDate}>
                      {new Date(comment.created_at).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={styles.commentText}>{comment.comment}</Text>
                  {comment.is_internal && (
                    <Text style={styles.internalBadge}>Internal</Text>
                  )}
                </View>
              ))}
            </View>
          )}

          {/* Additional Info Card */}
          <View style={styles.additionalInfoCard}>
            <View style={styles.additionalInfoHeader}>
              <Text style={styles.additionalInfoIcon}>ℹ️</Text>
              <Text style={styles.additionalInfoTitle}>Report Information</Text>
            </View>
            <View style={styles.infoRows}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Report ID</Text>
                <Text style={styles.infoValue}>#{report.id.slice(-8)}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Anonymous</Text>
                <Text style={styles.infoValue}>
                  {report.is_anonymous ? "Yes" : "No"}
                </Text>
              </View>
              {report.reporter_contact && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Contact</Text>
                  <Text style={styles.infoValue}>
                    {report.reporter_contact}
                  </Text>
                </View>
              )}
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Created</Text>
                <Text style={styles.infoValue}>
                  {new Date(report.created_at).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Last Updated</Text>
                <Text style={styles.infoValue}>
                  {new Date(report.updated_at).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Admin Actions Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerTitle}>Update Status</Text>
          <View style={styles.actionButtons}>
            {/* First Row - Primary Actions */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.reviewButton]}
                onPress={() => handleStatusUpdate("reviewing")}
                activeOpacity={0.8}
              >
                <Text style={styles.actionButtonIcon}>👀</Text>
                <Text style={styles.actionButtonText}>Review</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.progressButton]}
                onPress={() => handleStatusUpdate("in_progress")}
                activeOpacity={0.8}
              >
                <Text style={styles.actionButtonIcon}>🔄</Text>
                <Text style={styles.actionButtonText}>In Progress</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.resolvedButton]}
                onPress={() => handleStatusUpdate("resolved")}
                activeOpacity={0.8}
              >
                <Text style={styles.actionButtonIcon}>✅</Text>
                <Text style={styles.actionButtonText}>Resolved</Text>
              </TouchableOpacity>
            </View>

            {/* Second Row - Secondary Actions */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.closedButton]}
                onPress={() => handleStatusUpdate("closed")}
                activeOpacity={0.8}
              >
                <Text style={styles.actionButtonIcon}>🔒</Text>
                <Text style={styles.actionButtonText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.rejectedButton]}
                onPress={() => handleStatusUpdate("rejected")}
                activeOpacity={0.8}
              >
                <Text style={styles.actionButtonIcon}>❌</Text>
                <Text style={styles.actionButtonText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Image Preview Modal */}
      {showImagePreview && report?.photo_urls && (
        <Modal
          visible={showImagePreview}
          transparent={true}
          animationType="fade"
          onRequestClose={handleCloseImagePreview}
        >
          <View style={styles.imagePreviewOverlay}>
            <View style={styles.imagePreviewHeader}>
              <Text style={styles.imagePreviewTitle}>
                Photo {selectedImageIndex + 1} of {report.photo_urls.length}
              </Text>
              <TouchableOpacity
                style={styles.imagePreviewCloseButton}
                onPress={handleCloseImagePreview}
              >
                <Text style={styles.imagePreviewCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.imagePreviewContainer}>
              <Image
                source={{ uri: report.photo_urls[selectedImageIndex] }}
                style={styles.imagePreviewImage}
                resizeMode="contain"
              />
            </View>

            {/* Navigation Controls */}
            {report.photo_urls.length > 1 && (
              <View style={styles.imageNavigation}>
                <TouchableOpacity
                  style={[
                    styles.navButton,
                    selectedImageIndex === 0 && styles.navButtonDisabled,
                  ]}
                  onPress={handlePrevImage}
                  disabled={selectedImageIndex === 0}
                >
                  <Text style={styles.navButtonText}>‹</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.navButton,
                    selectedImageIndex === report.photo_urls.length - 1 &&
                      styles.navButtonDisabled,
                  ]}
                  onPress={handleNextImage}
                  disabled={selectedImageIndex === report.photo_urls.length - 1}
                >
                  <Text style={styles.navButtonText}>›</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Modal>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  // Gradient Header
  header: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },
  headerGradient: {
    backgroundColor: "#FF9B00",
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  reportNumber: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.9)",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    fontWeight: "500",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "700",
  },
  // Content
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  // Hero Section
  heroSection: {
    marginTop: 16,
    marginBottom: 12,
  },
  titleContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.textPrimary,
    lineHeight: 26,
    flex: 1,
    marginRight: 12,
  },
  statusContainer: {
    alignSelf: "flex-start",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  statusIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  // Meta Cards
  metaCards: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  metaCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryCard: {
    backgroundColor: "#FFF8E1",
  },
  priorityCard: {
    backgroundColor: "#FFF3C4",
  },
  metaCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  metaCardIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  metaCardTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  metaCardValue: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  // Description Card
  descriptionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  descriptionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  descriptionIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  descriptionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  description: {
    fontSize: 15,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  // Info Cards
  infoCards: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  infoCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  locationCard: {
    backgroundColor: "#F5F5DC",
  },
  reporterCard: {
    backgroundColor: "#FFF8E1",
  },
  infoCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  infoCardIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  infoCardTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  locationText: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: "600",
    marginBottom: 3,
  },
  specificLocation: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: "italic",
  },
  reporterName: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: "700",
    marginBottom: 3,
  },
  reportDate: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  // Assignment Card
  assignmentCard: {
    backgroundColor: "#E3F2FD",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  assignmentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  assignmentIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  assignmentTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  assignedAdmin: {
    fontSize: 16,
    color: Colors.textPrimary,
    fontWeight: "700",
    marginBottom: 4,
  },
  assignedEmail: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  // Comments Card
  commentsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  commentsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  commentsIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  commentsTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  commentItem: {
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  commentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  commentAuthor: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  commentDate: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  commentText: {
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 18,
  },
  internalBadge: {
    fontSize: 10,
    color: "#FF9B00",
    fontWeight: "600",
    marginTop: 4,
  },
  // Photos Card
  photosCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  photosHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  photosIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  photosTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  photosContainer: {
    marginTop: 0,
  },
  photoWrapper: {
    marginRight: 8,
    borderRadius: 8,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  photo: {
    width: 80,
    height: 80,
  },
  // Additional Info Card
  additionalInfoCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  additionalInfoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  additionalInfoIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  additionalInfoTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textPrimary,
  },
  infoRows: {
    gap: 8,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  infoValue: {
    fontSize: 12,
    color: Colors.textPrimary,
    fontWeight: "700",
    textAlign: "right",
    flex: 1,
    marginLeft: 16,
  },
  // Footer
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  footerTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 8,
    textAlign: "center",
  },
  actionButtons: {
    gap: 6,
  },
  actionRow: {
    flexDirection: "row",
    gap: 6,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  reviewButton: {
    backgroundColor: "#3B82F6",
  },
  progressButton: {
    backgroundColor: "#06B6D4",
  },
  resolvedButton: {
    backgroundColor: "#10B981",
  },
  rejectedButton: {
    backgroundColor: "#EF4444",
  },
  closedButton: {
    backgroundColor: "#6B7280",
  },
  actionButtonIcon: {
    fontSize: 14,
    marginBottom: 2,
  },
  actionButtonText: {
    fontSize: 11,
    color: "#FFFFFF",
    fontWeight: "700",
    textAlign: "center",
  },
  // Image Preview Modal Styles
  imagePreviewOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  imagePreviewHeader: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 20,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    zIndex: 1,
  },
  imagePreviewTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  imagePreviewCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  imagePreviewCloseText: {
    fontSize: 20,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  imagePreviewContainer: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  imagePreviewImage: {
    width: width - 40,
    height: height * 0.7,
    maxWidth: width - 40,
    maxHeight: height * 0.7,
  },
  imageNavigation: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 50 : 30,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  navButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  navButtonDisabled: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  navButtonText: {
    fontSize: 24,
    color: "#FFFFFF",
    fontWeight: "600",
  },
});

export default AdminReportDetailModal;
