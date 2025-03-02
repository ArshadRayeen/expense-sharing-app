import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { FAB, Portal } from 'react-native-paper';
import { AddExpenseModal } from '../expenses/AddExpenseModal';
import { AddFriendModal } from '../friends/AddFriendModal';
import { CreateGroupModal } from '../groups/CreateGroupModal';

export const FABMenu = () => {
  const [showFAB, setShowFAB] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  return (
    <>
      <Portal>
        <FAB.Group
          open={showFAB}
          visible
          icon={showFAB ? 'close' : 'plus'}
          actions={[
            {
              icon: 'cash-plus',
              label: 'Add Expense',
              onPress: () => setShowAddExpense(true),
            },
            {
              icon: 'account-plus',
              label: 'Add Friend',
              onPress: () => setShowAddFriend(true),
            },
            {
              icon: 'account-group-outline',
              label: 'Create Group',
              onPress: () => setShowCreateGroup(true),
            },
          ]}
          onStateChange={({ open }) => setShowFAB(open)}
          style={styles.fab}
        />
      </Portal>

      <AddExpenseModal
        visible={showAddExpense}
        onDismiss={() => setShowAddExpense(false)}
      />

      <AddFriendModal
        visible={showAddFriend}
        onDismiss={() => setShowAddFriend(false)}
      />

      <CreateGroupModal
        visible={showCreateGroup}
        onDismiss={() => setShowCreateGroup(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 65,
    alignSelf: 'center',
  },
}); 