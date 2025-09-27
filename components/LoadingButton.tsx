import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from 'react-native';
import { Colors } from '../constants/Colors';

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: any;
  backgroundColor?: string;
  textColor?: string;
  loadingText?: string;
}

const LoadingButton: React.FC<Props> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  style,
  backgroundColor = Colors.primary,
  textColor = Colors.textLight,
  loadingText = 'Loading...',
}) => {
  const isDisabled = loading || disabled;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: isDisabled ? Colors.textMuted : backgroundColor },
        style,
        isDisabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator 
            size="small" 
            color={textColor} 
            style={styles.spinner}
          />
          <Text style={[styles.buttonText, { color: textColor }]}>
            {loadingText}
          </Text>
        </View>
      ) : (
        <Text style={[styles.buttonText, { color: textColor }]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  disabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spinner: {
    marginRight: 10,
  },
});

export default LoadingButton;
