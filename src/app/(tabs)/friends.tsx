import React, { useState } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Searchbar, Button, Text } from 'react-native-paper';
import { useAppSelector } from '../../redux/hooks';
import { FriendCard } from '../../components/friends/FriendCard';
import { AddFriendModal } from '../../components/friends/AddFriendModal';

export default function FriendsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddFriend, setShowAddFriend] = useState(false);
  const { friends } = useAppSelector(state => state.friends);

  const filteredFriends = friends.filter(friend => 
    friend.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search friends"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <FlatList
        data={filteredFriends}
        renderItem={({ item }) => <FriendCard friend={item} />}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="titleMedium">No friends yet</Text>
            <Button
              mode="contained"
              onPress={() => setShowAddFriend(true)}
              style={styles.addButton}
            >
              Add Friend
            </Button>
          </View>
        }
      />

      <AddFriendModal
        visible={showAddFriend}
        onDismiss={() => setShowAddFriend(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchBar: {
    margin: 16,
    elevation: 2,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  addButton: {
    marginTop: 16,
  },
});