import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { FAB } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { fetchGroups } from '../redux/slices/groupSlice';
import { CreateGroupModal } from '../components/groups/CreateGroupModal';

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
      {/* Your groups list here */}
      {/* <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => setShowCreateGroup(true)}
      /> */}
      <CreateGroupModal
        visible={showCreateGroup}
        onDismiss={() => setShowCreateGroup(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
}); 