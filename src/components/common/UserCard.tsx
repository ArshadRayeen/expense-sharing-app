import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Text, Avatar } from 'react-native-paper';
import { formatCurrency } from '../../utils/helpers';

interface UserCardProps {
  userId: string;
  name?: string;
  amount: number;
  isOwed: boolean;
  onPress?: () => void;
}

const UserCard = ({ userId, name, amount, isOwed, onPress }: UserCardProps) => {
  const displayName = name || userId;
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content style={styles.content}>
        <Avatar.Text size={40} label={initial} style={styles.avatar} />
        <Text style={styles.name}>{displayName}</Text>
        <Text style={isOwed ? styles.owed : styles.owes}>
          {isOwed 
            ? `Owes yousss ${formatCurrency(amount)}`
            : `You owe ${formatCurrency(amount)}`}
        </Text>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 10,
    elevation: 2,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: 15,
    backgroundColor: '#1E88E5',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  owes: {
    color: 'red',
    fontWeight: '500',
  },
  owed: {
    color: 'green',
    fontWeight: '500',
  },
});

export default UserCard; 