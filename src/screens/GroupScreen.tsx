import React from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { Text, Card, Button } from 'react-native-paper';

const GroupScreen = () => {
  // This would be populated from Redux in a real implementation
  const groups = [];

  return (
    <View style={styles.container}>
      {groups.length > 0 ? (
        <FlatList
          data={groups}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.groupName}>{item.name}</Text>
                <Text>Total balance: {item.totalBalance}</Text>
              </Card.Content>
              <Card.Actions>
                <Button onPress={() => console.log('View group details')}>
                  View Details
                </Button>
                <Button 
                  mode="contained" 
                  onPress={() => console.log('Simplify debts')}
                >
                  Simplify Debts
                </Button>
              </Card.Actions>
            </Card>
          )}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No groups yet</Text>
          <Text>Create a group to start splitting expenses</Text>
          <Button 
            mode="contained" 
            style={styles.createButton}
            onPress={() => console.log('Create group')}
          >
            Create Group
          </Button>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
  },
  card: {
    marginBottom: 10,
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  createButton: {
    marginTop: 20,
  },
});

export default GroupScreen; 