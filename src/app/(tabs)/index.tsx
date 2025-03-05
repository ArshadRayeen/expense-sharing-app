import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Text, FAB, Portal, Modal, Button, Searchbar } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchExpenses } from '../../redux/slices/expenseSlice';
import { fetchGroups } from '../../redux/slices/groupSlice';
import { fetchFriends } from '../../redux/slices/friendSlice';
import { AddExpenseModal } from '../../components/expenses/AddExpenseModal';
import { AddFriendModal } from '../../components/friends/AddFriendModal';
import { CreateGroupModal } from '../../components/groups/CreateGroupModal';
import { ExpenseCard } from '../../components/expenses/ExpenseCard';
import { GroupCard } from '../../components/groups/GroupCard';
import { FriendCard } from '../../components/friends/FriendCard';
import { Expense } from '../../types';

export default function ActivityScreen() {
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showFAB, setShowFAB] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { expenses } = useAppSelector(state => state.expenses);
  const { groups } = useAppSelector(state => state.groups);
  const { friends } = useAppSelector(state => state.friends);

  useEffect(() => {
    if (user) {
      dispatch(fetchExpenses(user.id));
      dispatch(fetchGroups(user.id));
      dispatch(fetchFriends(user.id));
    }
  }, [dispatch, user]);

  const filteredExpenses = expenses.filter(expense => 
    expense.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search expenses"
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      <FlatList
        data={filteredExpenses}
        ListHeaderComponent={() => (
          <>
            {/* <View style={styles.section}>
              <Text variant="titleLarge">Your Groups</Text>
              <FlatList
                horizontal
                data={groups}
                renderItem={({ item }) => <GroupCard group={item} />}
                keyExtractor={item => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
              />
            </View>

            <View style={styles.section}>
              <Text variant="titleLarge">Friends</Text>
              <FlatList
                horizontal
                data={friends}
                renderItem={({ item }) => <FriendCard friend={item} />}
                keyExtractor={item => item.id}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
              />
            </View> */}

            <Text variant="titleLarge" style={styles.sectionTitle}>Recent Expenses</Text>
          </>
        )}
        renderItem={({ item }) => <ExpenseCard expense={item} />}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text variant="titleMedium">No expenses found</Text>
            <Text variant="bodyMedium">Add your first expense using the + button</Text>
          </View>
        }
      />

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    padding: 16,
    paddingBottom: 8,
  },
  horizontalList: {
    paddingTop: 8,
    alignItems: 'center',
    padding:10
  },
  fab: {
    position: 'absolute',
    margin: 0,
    right: 0,
    bottom: 60,
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
}); 