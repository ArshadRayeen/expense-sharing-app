import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Dialog, Portal, Text, Button, Divider } from 'react-native-paper';
import { Balance } from '../../types';
import { formatCurrency } from '../../utils/helpers';

interface DebtSimplifierProps {
  visible: boolean;
  onDismiss: () => void;
  originalBalances: Balance[];
  simplifiedBalances: Balance[];
}

const DebtSimplifier = ({ 
  visible, 
  onDismiss, 
  originalBalances, 
  simplifiedBalances 
}: DebtSimplifierProps) => {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        <Dialog.Title>Simplified Debts</Dialog.Title>
        <Dialog.ScrollArea style={styles.scrollArea}>
          <ScrollView>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Before Simplification:</Text>
              <Text style={styles.transactionCount}>
                {originalBalances.length} transaction{originalBalances.length !== 1 ? 's' : ''}
              </Text>
              <Divider style={styles.divider} />
              {originalBalances.map((balance, index) => (
                <Text key={`original-${index}`} style={styles.balanceText}>
                  {balance.userId} owes {balance.otherUserId}: {formatCurrency(balance.amount)}
                </Text>
              ))}
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>After Simplification:</Text>
              <Text style={styles.transactionCount}>
                {simplifiedBalances.length} transaction{simplifiedBalances.length !== 1 ? 's' : ''}
              </Text>
              <Divider style={styles.divider} />
              {simplifiedBalances.map((balance, index) => (
                <Text key={`simplified-${index}`} style={styles.balanceText}>
                  {balance.userId} owes {balance.otherUserId}: {formatCurrency(balance.amount)}
                </Text>
              ))}
            </View>
          </ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Close</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  dialog: {
    maxHeight: '80%',
  },
  scrollArea: {
    maxHeight: 400,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  transactionCount: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 5,
  },
  divider: {
    marginVertical: 10,
  },
  balanceText: {
    fontSize: 14,
    marginBottom: 5,
  },
});

export default DebtSimplifier; 