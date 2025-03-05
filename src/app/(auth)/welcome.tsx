import React, { useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import { router, useRootNavigationState } from 'expo-router';
import { useAppSelector } from '../../redux/hooks';

export default function WelcomeScreen() {
  const fadeAnim = new Animated.Value(0);
  const { user } = useAppSelector(state => state.auth);
  const navigationState = useRootNavigationState();

  useEffect(() => {
    if (!navigationState?.key) return;

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    const timer = setTimeout(() => {
      if (user) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/landing');
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [user, navigationState?.key]);

  if (!navigationState?.key) return null;

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity: fadeAnim }}>
        <View style={styles.logoContainer}>
          <Text variant="displayLarge" style={styles.logo}>Split</Text>
        </View>
        <Text variant="titleLarge" style={styles.tagline}>
          Split Smarter, Settle Easier
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1E88E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logo: {
    color: '#fff',
    fontWeight: 'bold',
  },
  tagline: {
    color: '#666',
    textAlign: 'center',
  },
}); 