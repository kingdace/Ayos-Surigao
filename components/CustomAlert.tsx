import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Colors } from '../constants/Colors';

interface Props {
  visible: boolean;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
  primaryButton?: {
    text: string;
    onPress: () => void;
  };
  secondaryButton?: {
    text: string;
    onPress: () => void;
  };
}

const CustomAlert: React.FC<Props> = ({
  visible,
  title,
  message,
  type = 'info',
  onClose,
  primaryButton,
  secondaryButton,
}) => {
  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: '✅',
          color: Colors.success,
          backgroundColor: '#E8F5E8',
        };
      case 'error':
        return {
          icon: '❌',
          color: Colors.error,
          backgroundColor: '#FFF0F0',
        };
      default:
        return {
          icon: 'ℹ️',
          color: Colors.info,
          backgroundColor: Colors.backgroundLight,
        };
    }
  };

  const config = getTypeConfig();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.alertContainer}>
          <View style={[styles.header, { backgroundColor: config.backgroundColor }]}>
            <Text style={styles.icon}>{config.icon}</Text>
            <Text style={[styles.title, { color: config.color }]}>{title}</Text>
          </View>
          
          <View style={styles.content}>
            <Text style={styles.message}>{message}</Text>
          </View>

          <View style={styles.buttonContainer}>
            {secondaryButton && (
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={secondaryButton.onPress}
              >
                <Text style={styles.secondaryButtonText}>
                  {secondaryButton.text}
                </Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={[
                styles.button,
                styles.primaryButton,
                { backgroundColor: config.color },
                !secondaryButton && styles.fullWidthButton,
              ]}
              onPress={primaryButton?.onPress || onClose}
            >
              <Text style={styles.primaryButtonText}>
                {primaryButton?.text || 'OK'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertContainer: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    width: '100%',
    maxWidth: 340,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  icon: {
    fontSize: 40,
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  message: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  fullWidthButton: {
    flex: 1,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  secondaryButton: {
    backgroundColor: Colors.backgroundDark,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  primaryButtonText: {
    color: Colors.textLight,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CustomAlert;
