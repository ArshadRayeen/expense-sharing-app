import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Modal, Portal, TextInput, Button, Text, HelperText } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { addFriend } from '../../redux/slices/friendSlice';
import { validateEmail } from '../../utils/validation';

interface Props {
  visible: boolean;
  onDismiss: () => void;
}

export const AddFriendModal = ({ visible, onDismiss }: Props) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector(state => state.friends);
  const { user } = useAppSelector(state => state.auth);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!user) {
      newErrors.submit = 'You must be logged in to add friends';
      return false;
    }

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      await dispatch(addFriend({ 
        name: name.trim(), 
        email: email.trim().toLowerCase() 
      })).unwrap();
      
      setName('');
      setEmail('');
      setErrors({});
      onDismiss();
    } catch (err) {
      setErrors({ 
        submit: err instanceof Error ? err.message : 'Failed to add friend'
      });
    }
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.container}>
        <Text variant="headlineSmall" style={styles.title}>Add Friend</Text>
        
        <TextInput
          label="Name"
          value={name}
          onChangeText={(text) => {
            setName(text);
            setErrors({ ...errors, name: '' });
          }}
          style={styles.input}
          error={!!errors.name}
        />
        {errors.name && <HelperText type="error">{errors.name}</HelperText>}
        
        <TextInput
          label="Email"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setErrors({ ...errors, email: '' });
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          error={!!errors.email}
        />
        {errors.email && <HelperText type="error">{errors.email}</HelperText>}
        
        {errors.submit && <HelperText type="error">{errors.submit}</HelperText>}
        
        <View style={styles.buttonContainer}>
          <Button 
            onPress={onDismiss} 
            style={styles.button}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            mode="contained" 
            onPress={handleSubmit} 
            style={styles.button}
            loading={isLoading}
            disabled={isLoading}
          >
            Add
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  button: {
    marginLeft: 8,
  },
}); 