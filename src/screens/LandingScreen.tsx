import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Button, Text, Snackbar, TextInput } from 'react-native-paper';
import { router } from 'expo-router';
import { validateEmail, validatePassword } from '../utils/validation';
import { userOperations, initDb } from '../services/db';
import { User } from '../types/user';
import { useDispatch } from 'react-redux';
import { setUser } from '../redux/slices/authSlice';

interface FormData {
  email: string;
  password: string;
  name?: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  name?: string;
}

const LandingScreen = () => {
  const dispatch = useDispatch();
  const [isSignUp, setIsSignUp] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    name: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDatabaseReady, setIsDatabaseReady] = useState(false);

  useEffect(() => {
    // Initialize database
    initDb()
      .then(() => setIsDatabaseReady(true))
      .catch((error: Error) => {
        console.error('Database initialization error:', error);
        showSnackbar('Failed to initialize database');
      });
  }, []);

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must contain at least 8 characters, including uppercase, lowercase, number and special character';
    }

    if (isSignUp && (!formData.name || formData.name.trim().length < 2)) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    try {
      const existingUser = await userOperations.getUserByEmail(formData.email);
      if (existingUser) {
        throw new Error('Email already exists');
      }

      await userOperations.addUser({
        id: Date.now().toString(),
        name: formData.name || '',
        email: formData.email,
        password_hash: formData.password // In real app, use proper password hashing
      });
    } catch (error) {
      throw error;
    }
  };

  const handleLogin = async (): Promise<User> => {
    try {
      const user = await userOperations.getUserByEmail(formData.email);
      if (!user || user.password_hash !== formData.password) {
        throw new Error('Invalid email or password');
      }
      return user;
    } catch (error) {
      throw error;
    }
  };

  const handleSubmit = async () => {
    if (!isDatabaseReady) {
      showSnackbar('Database not ready yet');
      return;
    }

    if (!validateForm()) {
      showSnackbar('Please fix the errors in the form');
      return;
    }

    setIsLoading(true);
    try {
      if (isSignUp) {
        await handleSignUp();
        showSnackbar('Account created successfully!');
        const newUser = await userOperations.getUserByEmail(formData.email);
        if (newUser) {
          dispatch(setUser(newUser));
        }
      } else {
        const user = await handleLogin();
        dispatch(setUser(user));
        showSnackbar('Login successful!');
      }
      
      router.replace('/(tabs)');
    } catch (error) {
      showSnackbar(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isDatabaseReady) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#1E88E5" />
        <Text style={styles.loadingText}>Initializing...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>Split</Text>
          </View>
        </View>
        
        <View style={styles.formContainer}>
          <Text style={styles.title}>{isSignUp ? 'Sign Up' : 'Log In'}</Text>
          
          {isSignUp && (
            <>
              <TextInput
                label="Name"
                value={formData.name}
                onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                style={styles.input}
                error={!!errors.name}
              />
              {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
            </>
          )}

          <TextInput
            label="Email"
            value={formData.email}
            onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
            error={!!errors.email}
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

          <TextInput
            label="Password"
            value={formData.password}
            onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
            secureTextEntry
            style={styles.input}
            error={!!errors.password}
          />
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
          
          <Button 
            mode="contained" 
            onPress={handleSubmit} 
            style={styles.button}
            loading={isLoading}
            disabled={isLoading}
          >
            {isSignUp ? 'Sign Up' : 'Log In'}
          </Button>
          
          <Button 
            mode="text" 
            onPress={() => setIsSignUp(!isSignUp)} 
            style={styles.switchButton}
          >
            {isSignUp ? 'Already have an account? Log In' : 'Don\'t have an account? Sign Up'}
          </Button>
        </View>
      </ScrollView>
      
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'Dismiss',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1E88E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  formContainer: {
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
    marginTop: -5,
  },
  button: {
    marginTop: 20,
    paddingVertical: 6,
  },
  switchButton: {
    marginTop: 15,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});

export default LandingScreen; 