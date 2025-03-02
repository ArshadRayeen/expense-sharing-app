import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, Avatar, useTheme } from 'react-native-paper';
import { Expense } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface Props {
  expense: Expense;
}

export const ExpenseCard = ({ expense }: Props) => {
  const theme = useTheme();

  return (
    <Card style={styles.card}>
      <Card.Content style={styles.content}>
        <View style={styles.leftContent}>
          <Avatar.Icon 
            size={40} 
            icon="cash" 
            style={{ backgroundColor: theme.colors.primary }}
          />
          <View style={styles.textContainer}>
            <Text variant="titleMedium">{expense.description}</Text>
            <Text variant="bodySmall" style={styles.date}>
              {formatDate(expense.date)}
            </Text>
          </View>
        </View>
        <View style={styles.rightContent}>
          <Text 
            variant="titleMedium" 
            style={styles.amount}
          >
            {formatCurrency(expense.amount)}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textContainer: {
    marginLeft: 12,
    flex: 1,
  },
  rightContent: {
    alignItems: 'flex-end',
  },
  date: {
    color: '#666',
    marginTop: 4,
  },
  amount: {
    fontWeight: 'bold',
  },
}); 