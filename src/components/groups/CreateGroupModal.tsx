import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Modal, Portal, TextInput, Button, Text, Checkbox, HelperText } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { createGroup } from '../../redux/slices/groupSlice';

interface Props {
  visible: boolean;
  onDismiss: () => void;
}

export const CreateGroupModal = ({ visible, onDismiss }: Props) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [selectedFriends, setSelectedFriends] = useState<Set<string>>(new Set());
  
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { friends } = useAppSelector(state => state.friends);
  const { isLoading } = useAppSelector(state => state.groups);

  const toggleFriend = (friendId: string) => {
    const newSelected = new Set(selectedFriends);
    if (newSelected.has(friendId)) {
      newSelected.delete(friendId);
    } else {
      newSelected.add(friendId);
    }
    setSelectedFriends(newSelected);
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    if (!name.trim()) {
      setError('Please enter a group name');
      return;
    }

    if (selectedFriends.size === 0) {
      setError('Please select at least one friend');
      return;
    }

    try {
      const members = [user.id, ...Array.from(selectedFriends)];
      await dispatch(createGroup({ name, members })).unwrap();
      setName('');
      setSelectedFriends(new Set());
      setError('');
      onDismiss();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create group');
    }
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.container}>
        <Text variant="headlineSmall" style={styles.title}>Create New Group</Text>
        
        <TextInput
          label="Group Name"
          value={name}
          onChangeText={(text) => {
            setName(text);
            setError('');
          }}
          style={styles.input}
          error={!!error}
        />
        {error && <HelperText type="error">{error}</HelperText>}
        
        <Text variant="titleMedium" style={styles.subtitle}>Select Members</Text>
        
        <ScrollView style={styles.friendsList}>
          {friends.map(friend => (
            <View key={friend.id} style={styles.friendItem}>
              <Checkbox
                status={selectedFriends.has(friend.id) ? 'checked' : 'unchecked'}
                onPress={() => toggleFriend(friend.id)}
              />
              <View>
                <Text>{friend.name}</Text>
                <Text style={styles.emailText}>{friend.email}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
        
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
            Create
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
    maxHeight: '80%',
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    marginBottom: 4,
  },
  friendsList: {
    maxHeight: 200,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  emailText: {
    fontSize: 12,
    color: '#666',
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