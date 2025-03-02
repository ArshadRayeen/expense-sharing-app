import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Text, Button, TextInput, Card, Snackbar } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { addSettlement } from '../redux/slices/expenseSlice';
import { Balance } from '../types';
import { calculateBalances, formatCurrency } from '../utils/helpers';
import { useNavigation, useRoute } from '@react-navigation/native';

const SettlementScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();
  const { userId, otherUserId, suggestedAmount } = route.params as { 
    userId: string; 
    otherUserId: string;
    suggestedAmount?: number;
  };
  
  const [amount, setAmount] = useState(suggestedAmount?.toString() || '');
  const [note, setNote] = useState('');
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  
  const currentUser = useSelector((state: RootState) => state.user.currentUser);
  const isLoading = useSelector((state: RootState) => state.expense.isLoading);
  
  const handleSettlement = () => {
    if (!amount || parseFloat(amount) <= 0) {
      setSnackbarMessage('Please enter a valid amount');
      setSnackbarVisible(true);
      return;
    }
    
    dispatch(addSettlement({
      payerId: userId,
      payeeId: otherUserId,
      amount: parseFloat(amount),
      note
    })).then(() => {
      setSnackbarMessage('Settlement recorded successfully');
      setSnackbarVisible(true);
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    }).catch((error) => {
      setSnackbarMessage(`Error: ${error.message}`);
      setSnackbarVisible(true);
    });
  };
  
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.title}>Record a Settlement</Text>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>From:</Text>
              <Text style={styles.value}>{userId}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.label}>To:</Text>
              <Text style={styles.value}>{otherUserId}</Text>
            </View>
            
            <TextInput
              label="Amount"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              style={styles.input}
              placeholder="0.00"
              left={<TextInput.Affix text="₹" />}
            />
            
            <TextInput
              label="Note (optional)"
              value={note}
              onChangeText={setNote}
              style={styles.input}
              placeholder="e.g., Rent payment"
              multiline
            />
            
            <Button
              mode="contained"
              onPress={handleSettlement}
              style={styles.button}
              loading={isLoading}
              disabled={isLoading}
            >
              Record Settlement
            </Button>
            
            <Button
              mode="outlined"
              onPress={() => navigation.goBack()}
              style={styles.cancelButton}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
      
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'Dismiss',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
  },
  card: {
    elevation: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  label: {
    fontSize: 16,
    color: '#757575',
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
  },
  input: {
    marginTop: 15,
    backgroundColor: 'white',
  },
  button: {
    marginTop: 30,
    paddingVertical: 8,
  },
  cancelButton: {
    marginTop: 15,
  },
});

export default SettlementScreen; 