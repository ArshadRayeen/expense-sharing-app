import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { FAB, Text, Button } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchGroups } from '../redux/slices/groupSlice';
import { CreateGroupModal } from '../components/groups/CreateGroupModal';
import { GroupCard } from '../components/groups/GroupCard';

export const GroupsScreen = () => {
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { groups } = useAppSelector(state => state.groups);

  useEffect(() => {
    if (user) {
      dispatch(fetchGroups(user.id));
    }
  }, [dispatch, user]);

  return (
    <View style={styles.container}>
      {groups.length > 0 ? (
        <FlatList
          data={groups}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <GroupCard group={item} />}
          contentContainerStyle={styles.groupList}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No groups yet</Text>
          <Text>Create a group to start splitting expenses</Text>
          <Button 
            mode="contained" 
            style={styles.createButton}
            onPress={() => setShowCreateGroup(true)}
          >
            Create Group
          </Button>
        </View>
      )}

      <CreateGroupModal
        visible={showCreateGroup}
        onDismiss={() => setShowCreateGroup(false)}
      />

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => setShowCreateGroup(true)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  groupList: {
    padding: 10,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  createButton: {
    marginTop: 20,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default GroupsScreen; 