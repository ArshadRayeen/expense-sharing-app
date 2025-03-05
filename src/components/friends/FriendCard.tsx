import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Text, Avatar } from 'react-native-paper';
import { Friend } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface Props {
  friend: Friend;
}

export const FriendCard = ({ friend }: Props) => {
  const isPositiveBalance = friend.balance >= 0;

  return (
    <Card style={styles.card}>
      <Card.Content style={styles.content}>
        <Avatar.Text 
          size={50} 
          label={friend.name.charAt(0).toUpperCase()} 
        />
        <Text variant="titleMedium" style={styles.name}>
          {friend.name}
        </Text>
        <Text 
          variant="bodyMedium" 
          style={[
            styles.balance,
            { color: isPositiveBalance ? '#4CAF50' : '#F44336' }
          ]}
        >
          {isPositiveBalance ? 'owes you ' : 'you owe '}
          {formatCurrency(Math.abs(friend.balance))}
        </Text>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 170,
    marginHorizontal:5
    // marginRight: 16,
  },
  content: {
    alignItems: 'center',
    padding: 16,
  },
  name: {
    marginTop: 8,
    textAlign: 'center',
  },
  balance: {
    marginTop: 4,
    textAlign: 'center',
  },
}); 