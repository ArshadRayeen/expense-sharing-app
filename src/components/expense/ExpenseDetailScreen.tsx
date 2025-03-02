import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, Card, Divider, Button, ActivityIndicator } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../redux/store';
import { useRoute, useNavigation } from '@react-navigation/native';
import { formatCurrency } from '../../utils/helpers';
import { SplitType } from '../../types';

const ExpenseDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { expenseId } = route.params as { expenseId: string };
  
  const [isLoading, setIsLoading] = useState(true);
  
  const expense = useSelector((state: RootState) => 
    state.expense.expenses.find(e => e.id === expenseId)
  );
  
  const splits = useSelector((state: RootState) => 
    state.expense.expenseSplits.filter(s => s.expenseId === expenseId)
  );
  
  const users = useSelector((state: RootState) => state.user.users);
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  
  useEffect(() => {
    // In a real app, you might want to fetch the expense details if not in Redux
    if (expense) {
      setIsLoading(false);
    }
  }, [expense]);
  
  const getUserName = (userId: string) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : userId;
  };
  
  const getSplitTypeLabel = (type?: SplitType) => {
    switch (type) {
      case SplitType.EQUAL:
        return 'Equal Split';
      case SplitType.EXACT:
        return 'Exact Amounts';
      case SplitType.PERCENT:
        return 'Percentage Split';
      default:
        return 'Split';
    }
  };
  
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E88E5" />
        <Text>Loading expense details...</Text>
      </View>
    );
  }
  
  if (!expense) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Expense not found</Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Go Back
        </Button>
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.title}>{expense.description}</Text>
          <Text style={styles.amount}>{formatCurrency(expense.amount)}</Text>
          
          <Divider style={styles.divider} />
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Paid by</Text>
            <Text style={styles.value}>{getUserName(expense.payerId)}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.value}>
              {new Date(expense.date).toLocaleDateString()}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.label}>Split type</Text>
            <Text style={styles.value}>{getSplitTypeLabel(expense.splitType)}</Text>
          </View>
          
          {expense.groupId && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Group</Text>
              <Text style={styles.value}>{expense.groupId}</Text>
            </View>
          )}
          
          <Divider style={styles.divider} />
          
          <Text style={styles.sectionTitle}>Split Details</Text>
          
          {splits.map((split) => (
            <View key={split.userId} style={styles.splitRow}>
              <Text style={styles.splitName}>{getUserName(split.userId)}</Text>
              <Text style={styles.splitAmount}>{formatCurrency(split.amountOwed)}</Text>
            </View>
          ))}
        </Card.Content>
      </Card>
      
      {currentUser && expense.payerId === currentUser.id && (
        <Button 
          mode="contained" 
          style={styles.button}
          onPress={() => {
            // Navigate to settlement screen or other action
          }}
        >
          Remind Others
        </Button>
      )}
      
      {currentUser && expense.payerId !== currentUser.id && splits.some(s => s.userId === currentUser.id) && (
        <Button 
          mode="contained" 
          style={styles.button}
          onPress={() => {
            // Navigate to settlement screen
            navigation.navigate('Settlement', {
              userId: currentUser.id,
              otherUserId: expense.payerId,
              suggestedAmount: splits.find(s => s.userId === currentUser.id)?.amountOwed
            });
          }}
        >
          Settle Up
        </Button>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  card: {
    margin: 16,
    elevation: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  amount: {
    fontSize: 24,
    color: '#1E88E5',
    marginBottom: 15,
  },
  divider: {
    marginVertical: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  label: {
    fontSize: 16,
    color: '#757575',
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  splitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  splitName: {
    fontSize: 16,
  },
  splitAmount: {
    fontSize: 16,
    fontWeight: '500',
  },
  button: {
    margin: 16,
    paddingVertical: 8,
  },
});

export default ExpenseDetailScreen; 