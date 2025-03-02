import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';

export const LoadingScreen = () => (
  <View style={styles.container}>
    <ActivityIndicator size="large" color="#1E88E5" />
    <Text style={styles.text}>Initializing...</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginTop: 16,
  },
}); 