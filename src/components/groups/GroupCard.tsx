import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, Avatar } from 'react-native-paper';
import { Group } from '../../types';
import { router } from 'expo-router';
import { formatDate } from '../../utils/formatters';

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
          size={60} 
          label={group.name.charAt(0).toUpperCase()} 
          style={styles.avatar}
        />
        <View style={styles.infoContainer}>
          <Text variant="titleMedium" style={styles.name}>
            {group.name}
          </Text>
          <Text variant="bodySmall" style={styles.memberCount}>
            {group?.members?.length} members
          </Text>
          <Text variant="bodySmall" style={styles.createdDate}>
            Group created on: {formatDate(group.created_at)}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '100%',
    marginBottom: 16,
    borderRadius: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatar: {
    marginRight: 16,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  memberCount: {
    color: '#666',
    marginTop: 4,
  },
  createdDate: {
    color: '#999',
    marginTop: 4,
  },
}); 