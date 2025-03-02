import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { Link, router } from 'expo-router';

export default function LandingScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text variant="displayLarge" style={styles.logo}>Split</Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <Button 
          mode="contained" 
          onPress={() => router.push('/(auth)/signup')}
          style={styles.button}
        >
          Sign Up
        </Button>
        
        <Button 
          mode="outlined" 
          onPress={() => router.push('/(auth)/login')}
          style={styles.button}
        >
          Log In
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1E88E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  logo: {
    color: '#fff',
    fontWeight: 'bold',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
  button: {
    marginVertical: 8,
    paddingVertical: 8,
  },
}); 