import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors } from '../constants/Colors';

const LoadingScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🏠</Text>
      <Text style={styles.title}>Fix My Barangay</Text>
      <ActivityIndicator size="large" color={Colors.primary} style={styles.spinner} />
      <Text style={styles.subtitle}>Loading...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.backgroundLight,
  },
  icon: {
    fontSize: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 30,
  },
  spinner: {
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
});

export default LoadingScreen;
