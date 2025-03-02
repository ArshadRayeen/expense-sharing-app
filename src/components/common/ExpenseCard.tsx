import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Text, Chip } from 'react-native-paper';
import { Expense, SplitType } from '../../types';
import { formatCurrency } from '../../utils/helpers';

interface ExpenseCardProps {
  expense: Expense;
  onPress?: () => void;
}

const ExpenseCard = ({ expense, onPress }: ExpenseCardProps) => {
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

  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content>
        <Text style={styles.description}>{expense.description}</Text>
        <Text style={styles.amount}>{formatCurrency(expense.amount)}</Text>
        <Text style={styles.details}>Paid by: {expense.payerId}</Text>
        <Text style={styles.details}>
          {new Date(expense.date).toLocaleDateString()}
        </Text>
        {expense.splitType && (
          <Chip style={styles.chip} mode="outlined">
            {getSplitTypeLabel(expense.splitType)}
          </Chip>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
    elevation: 2,
  },
  description: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  amount: {
    fontSize: 16,
    color: '#1E88E5',
    marginBottom: 10,
  },
  details: {
    color: '#757575',
    fontSize: 14,
    marginBottom: 3,
  },
  chip: {
    alignSelf: 'flex-start',
    marginTop: 10,
  },
});

export default ExpenseCard; 