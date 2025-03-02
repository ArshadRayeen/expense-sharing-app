import React from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { Text, Card, Searchbar } from 'react-native-paper';

const FriendsScreen = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  // This would be populated from Redux in a real implementation
  const friends = [];

  const onChangeSearch = (query) => setSearchQuery(query);

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search friends"
        onChangeText={onChangeSearch}
        value={searchQuery}
        style={styles.searchBar}
      />
      
      {friends.length > 0 ? (
        <FlatList
          data={friends}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={item.balance > 0 ? styles.owes : styles.owed}>
                  {item.balance > 0 
                    ? `${item.name} owes you ${item.balance}`
                    : `You owe ${item.name} ${Math.abs(item.balance)}`}
                </Text>
              </Card.Content>
            </Card>
          )}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No friends yet</Text>
          <Text>Add friends to start splitting expenses</Text>
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
  searchBar: {
    marginBottom: 10,
  },
  card: {
    marginBottom: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  owes: {
    color: 'green',
  },
  owed: {
    color: 'red',
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
});

export default FriendsScreen; 