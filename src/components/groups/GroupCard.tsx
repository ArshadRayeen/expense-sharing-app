import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Text, Avatar } from 'react-native-paper';
import { Group } from '../../types';
import { router } from 'expo-router';

interface Props {
  group: Group;
}

export const GroupCard = ({ group }: Props) => {
  const handlePress = () => {
    router.push(`/groups/${group.id}`);
  };

  return (
    <Card 
      style={styles.card} 
      onPress={handlePress}
    >
      <Card.Content style={styles.content}>
        <Avatar.Text 
          size={50} 
          label={group.name.charAt(0).toUpperCase()} 
        />
        <Text variant="titleMedium" style={styles.name}>
          {group.name}
        </Text>
        <Text variant="bodySmall" style={styles.memberCount}>
          {group.members.length} members
        </Text>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    width: 150,
    marginRight: 16,
  },
  content: {
    alignItems: 'center',
    padding: 16,
  },
  name: {
    marginTop: 8,
    textAlign: 'center',
  },
  memberCount: {
    color: '#666',
    marginTop: 4,
  },
}); 