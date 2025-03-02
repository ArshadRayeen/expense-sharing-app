import React, { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, Button, TextInput, Divider } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { router } from 'expo-router';

const AccountScreen = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isEditing, setIsEditing] = useState(false);

  const handleLogout = () => {
    dispatch(clearUser());
    router.replace('/auth/login');
  };

  const handleSaveProfile = () => {
    if (user) {
      dispatch(setUser({ ...user, name, email }));
      setIsEditing(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>
            {name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.headerText}>
          {user?.name || 'User'}
        </Text>
        <Text style={styles.subHeaderText}>
          {user?.email || 'email@example.com'}
        </Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile Information</Text>
        
        {isEditing ? (
          <View>
            <TextInput
              label="Name"
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <View style={styles.buttonRow}>
              <Button 
                mode="outlined" 
                onPress={() => setIsEditing(false)}
                style={styles.button}
              >
                Cancel
              </Button>
              <Button 
                mode="contained" 
                onPress={handleSaveProfile}
                style={styles.button}
              >
                Save
              </Button>
            </View>
          </View>
        ) : (
          <View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Name</Text>
              <Text style={styles.value}>{user?.name || 'Not set'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{user?.email || 'Not set'}</Text>
            </View>
            <Button 
              mode="outlined" 
              onPress={() => setIsEditing(true)}
              style={styles.editButton}
            >
              Edit Profile
            </Button>
          </View>
        )}
      </View>
      
      <Divider style={styles.divider} />
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Settings</Text>
        <Button 
          mode="outlined" 
          onPress={handleLogout}
          style={styles.logoutButton}
          icon="logout"
        >
          Log Out
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1E88E5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  subHeaderText: {
    fontSize: 16,
    color: '#757575',
  },
  section: {
    padding: 20,
    backgroundColor: 'white',
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  label: {
    fontSize: 16,
    color: '#757575',
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    marginBottom: 15,
    backgroundColor: 'white',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
  editButton: {
    marginTop: 20,
  },
  divider: {
    marginVertical: 30,
    height: 1,
  },
  logoutButton: {
    marginTop: 10,
  },
});

export default AccountScreen; 