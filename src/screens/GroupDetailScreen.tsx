import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, Modal } from 'react-native';
import { Text, Card, Button, FAB, Portal, Dialog, TextInput, ActivityIndicator } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../redux/store';
import { useRoute, useNavigation } from '@react-navigation/native';
import { addMemberToGroup } from '../redux/slices/groupSlice';
import { addExpense, fetchExpensesForUser } from '../redux/slices/expenseSlice';
import { ExpenseFormData, SplitType } from '../types';
import { generateId } from '../utils/helpers';
import ExpenseCard from '../components/common/ExpenseCard';
import SplitInput from '../components/common/SplitInput';

const GroupDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { groupId } = route.params as { groupId: string };
  
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [expenseForm, setExpenseForm] = useState<ExpenseFormData>({
    amount: '',
    description: '',
    payerId: '',
    participants: [],
    splitType: SplitType.EQUAL,
    exactAmounts: {},
    percentages: {},
  });
  
  const group = useSelector((state: RootState) => 
    state.group.groups.find(g => g.id === groupId)
  );
  
  const groupMembers = useSelector((state: RootState) => 
    state.group.groupMembers[groupId] || []
  );
  
  const users = useSelector((state: RootState) => state.user.users);
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const expenses = useSelector((state: RootState) => 
    state.expense.expenses.filter(e => e.groupId === groupId)
  );
  const isLoading = useSelector((state: RootState) => 
    state.group.isLoading || state.expense.isLoading
  );
  
  useEffect(() => {
    if (currentUser) {
      dispatch(fetchExpensesForUser(currentUser.id));
    }
  }, [dispatch, currentUser]);
  
  useEffect(() => {
    // Initialize expense form with current user as payer and all group members as participants
    if (currentUser && groupMembers.length > 0) {
      setExpenseForm(prev => ({
        ...prev,
        payerId: currentUser.id,
        participants: groupMembers,
      }));
    }
  }, [currentUser, groupMembers]);
  
  const handleAddMember = () => {
    // In a real app, you would search for the user by email
    const userToAdd = users.find(u => u.email === newMemberEmail);
    
    if (!userToAdd) {
      // Show error
      return;
    }
    
    if (groupMembers.includes(userToAdd.id)) {
      // User already in group
      return;
    }
    
    dispatch(addMemberToGroup({ groupId, userId: userToAdd.id }))
      .then(() => {
        setIsAddingMember(false);
        setNewMemberEmail('');
      });
  };
  
  const handleAddExpense = () => {
    if (!expenseForm.amount || !expenseForm.description || !expenseForm.payerId) {
      // Show validation error
      return;
    }
    
    const amount = parseFloat(expenseForm.amount);
    if (isNaN(amount) || amount <= 0) {
      // Show validation error
      return;
    }
    
    dispatch(addExpense({
      amount,
      description: expenseForm.description,
      payerId: expenseForm.payerId,
      participants: expenseForm.participants,
      splitType: expenseForm.splitType,
      exactAmounts: expenseForm.exactAmounts,
      percentages: expenseForm.percentages,
      groupId,
    }))
      .then(() => {
        setIsAddingExpense(false);
        // Reset form
        setExpenseForm({
          amount: '',
          description: '',
          payerId: currentUser?.id || '',
          participants: groupMembers,
          splitType: SplitType.EQUAL,
          exactAmounts: {},
          percentages: {},
        });
      });
  };
  
  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : userId;
  };
  
  if (!group) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Group not found</Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Go Back
        </Button>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Card style={styles.groupCard}>
        <Card.Content>
          <Text style={styles.groupName}>{group.name}</Text>
          <Text style={styles.memberCount}>
            {groupMembers.length} member{groupMembers.length !== 1 ? 's' : ''}
          </Text>
        </Card.Content>
      </Card>
      
      <View style={styles.membersSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Members</Text>
          <Button 
            mode="text" 
            onPress={() => setIsAddingMember(true)}
            disabled={isLoading}
          >
            Add Member
          </Button>
        </View>
        
        <FlatList
          data={groupMembers}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <Card style={styles.memberCard}>
              <Card.Content>
                <Text>{getUserName(item)}</Text>
              </Card.Content>
            </Card>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No members in this group yet.</Text>
          }
        />
      </View>
      
      <View style={styles.expensesSection}>
        <Text style={styles.sectionTitle}>Expenses</Text>
        
        <FlatList
          data={expenses}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ExpenseCard 
              expense={item} 
              onPress={() => navigation.navigate('ExpenseDetail', { expenseId: item.id })}
            />
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No expenses in this group yet.</Text>
          }
        />
      </View>
      
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => setIsAddingExpense(true)}
        disabled={isLoading}
      />
      
      {/* Add Member Dialog */}
      <Portal>
        <Dialog visible={isAddingMember} onDismiss={() => setIsAddingMember(false)}>
          <Dialog.Title>Add Member</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Member Email"
              value={newMemberEmail}
              onChangeText={setNewMemberEmail}
              style={styles.input}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setIsAddingMember(false)}>Cancel</Button>
            <Button onPress={handleAddMember} disabled={!newMemberEmail || isLoading}>
              Add
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
      
      {/* Add Expense Modal */}
      <Portal>
        <Modal
          visible={isAddingExpense}
          onDismiss={() => setIsAddingExpense(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Expense</Text>
            
            <TextInput
              label="Description"
              value={expenseForm.description}
              onChangeText={(text) => setExpenseForm(prev => ({ ...prev, description: text }))}
              style={styles.input}
            />
            
            <TextInput
              label="Amount"
              value={expenseForm.amount}
              onChangeText={(text) => setExpenseForm(prev => ({ ...prev, amount: text }))}
              keyboardType="numeric"
              style={styles.input}
              left={<TextInput.Affix text="₹" />}
            />
            
            <Text style={styles.inputLabel}>Paid by</Text>
            <FlatList
              data={groupMembers}
              horizontal
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Button
                  mode={expenseForm.payerId === item ? 'contained' : 'outlined'}
                  onPress={() => setExpenseForm(prev => ({ ...prev, payerId: item }))}
                  style={styles.memberButton}
                >
                  {getUserName(item)}
                </Button>
              )}
            />
            
            <Text style={styles.inputLabel}>Split with</Text>
            <FlatList
              data={groupMembers}
              horizontal
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Button
                  mode={expenseForm.participants.includes(item) ? 'contained' : 'outlined'}
                  onPress={() => {
                    const newParticipants = expenseForm.participants.includes(item)
                      ? expenseForm.participants.filter(id => id !== item)
                      : [...expenseForm.participants, item];
                    
                    setExpenseForm(prev => ({ 
                      ...prev, 
                      participants: newParticipants,
                      // Reset split amounts when participants change
                      exactAmounts: {},
                      percentages: {},
                    }));
                  }}
                  style={styles.memberButton}
                >
                  {getUserName(item)}
                </Button>
              )}
            />
            
            {expenseForm.amount && expenseForm.participants.length > 0 && (
              <SplitInput
                splitType={expenseForm.splitType}
                onSplitTypeChange={(type) => setExpenseForm(prev => ({ ...prev, splitType: type }))}
                participants={expenseForm.participants}
                amount={parseFloat(expenseForm.amount) || 0}
                onExactAmountsChange={(amounts) => setExpenseForm(prev => ({ ...prev, exactAmounts: amounts }))}
                onPercentagesChange={(percentages) => setExpenseForm(prev => ({ ...prev, percentages }))}
                exactAmounts={expenseForm.exactAmounts || {}}
                percentages={expenseForm.percentages || {}}
              />
            )}
            
            <View style={styles.buttonRow}>
              <Button 
                mode="outlined" 
                onPress={() => setIsAddingExpense(false)}
                style={styles.button}
              >
                Cancel
              </Button>
              <Button 
                mode="contained" 
                onPress={handleAddExpense}
                style={styles.button}
                loading={isLoading}
                disabled={isLoading || !expenseForm.amount || !expenseForm.description || !expenseForm.payerId || expenseForm.participants.length === 0}
              >
                Save
              </Button>
            </View>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    marginBottom: 20,
  },
  groupCard: {
    margin: 16,
    elevation: 4,
  },
  groupName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  memberCount: {
    fontSize: 14,
    color: '#757575',
    marginTop: 5,
  },
  membersSection: {
    margin: 16,
    marginTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  memberCard: {
    marginBottom: 8,
  },
  expensesSection: {
    margin: 16,
    marginTop: 0,
    flex: 1,
  },
  emptyText: {
    textAlign: 'center',
    color: '#757575',
    marginTop: 20,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#1E88E5',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  modalContent: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 5,
  },
  memberButton: {
    marginRight: 8,
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
});

export default GroupDetailScreen; 