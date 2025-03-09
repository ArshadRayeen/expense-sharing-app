import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Modal, Portal, TextInput, Button, Text, RadioButton, Checkbox, HelperText, Menu, Provider } from 'react-native-paper';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { addExpense } from '../../redux/slices/expenseSlice';
import { fetchGroups } from '../../redux/slices/groupSlice';

type SplitType = 'EQUAL' | 'EXACT' | 'PERCENT';

interface Props {
  visible: boolean;
  onDismiss: () => void;
}

export const AddExpenseModal = ({ visible, onDismiss }: Props) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [splitType, setSplitType] = useState<SplitType>('EQUAL');
  const [selectedParticipants, setSelectedParticipants] = useState<Set<string>>(new Set());
  const [customSplits, setCustomSplits] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [groupMenuVisible, setGroupMenuVisible] = useState(false);

  const dispatch = useAppDispatch();
  const { user } = useAppSelector(state => state.auth);
  const { friends } = useAppSelector(state => state.friends);
  const { groups } = useAppSelector(state => state.groups);
  const { isLoading } = useAppSelector(state => state.expenses);

  useEffect(() => {
    if (user) {
      dispatch(fetchGroups(user.id));
      setSelectedParticipants(new Set([user.id]));
    }
  }, [dispatch, user]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Amount validation
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0 || numAmount > 999999.99) {
      newErrors.amount = 'Please enter a valid amount (0-999,999.99)';
    }

    // Description validation
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }

    // Participants validation
    if (selectedParticipants.size < 2) {
      newErrors.participants = 'Select at least one friend';
    }

    // Split validation
    if (splitType === 'EXACT') {
      const total = Object.values(customSplits)
        .reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
      if (Math.abs(total - parseFloat(amount)) > 0.01) {
        newErrors.splits = 'Split amounts must sum to total';
      }
    } else if (splitType === 'PERCENT') {
      const total = Object.values(customSplits)
        .reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
      if (Math.abs(total - 100) > 0.01) {
        newErrors.splits = 'Percentages must sum to 100%';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!user) return;

    if (!description.trim()) {
      setErrors({ description: 'Please enter a description' });
      return;
    }

    if (selectedParticipants.size < 2) {
      setErrors({ participants: 'Please select at least one participant' });
      return;
    }

    try {
      const payload: AddExpensePayload = {
        amount,
        description,
        payer_id: user.id,
        split_type: 'EQUAL',
        participants: Array.from(selectedParticipants).map(participantId => ({
          user_id: participantId,
          amount: parseFloat(customSplits[participantId] || '0'),
        })),
        group_id: selectedGroupId,
      };

      await dispatch(addExpense(payload)).unwrap();
      onDismiss();
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : 'Failed to add expense' });
    }
  };

  return (
    <Portal>
      <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.container}>
        <ScrollView>
          <Text variant="headlineSmall" style={styles.title}>Add New Expense</Text>

          <TextInput
            label="Amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            style={styles.input}
            error={!!errors.amount}
          />
          {errors.amount && <HelperText type="error">{errors.amount}</HelperText>}

          <TextInput
            label="Description"
            value={description}
            onChangeText={setDescription}
            style={styles.input}
            error={!!errors.description}
          />
          {errors.description && <HelperText type="error">{errors.description}</HelperText>}

          <Text variant="titleMedium" style={styles.sectionTitle}>Split Type</Text>
          <RadioButton.Group onValueChange={value => setSplitType(value as SplitType)} value={splitType}>
            <RadioButton.Item label="Split Equally" value="EQUAL" />
            <RadioButton.Item label="Split by Exact Amounts" value="EXACT" />
            <RadioButton.Item label="Split by Percentages" value="PERCENT" />
          </RadioButton.Group>

          <Text variant="titleMedium" style={styles.sectionTitle}>Select Participants</Text>
          {friends.map(friend => (
            <Checkbox.Item
              key={friend.id}
              label={friend.name}
              status={selectedParticipants.has(friend.id) ? 'checked' : 'unchecked'}
              onPress={() => {
                const newSelected = new Set(selectedParticipants);
                if (newSelected.has(friend.id)) {
                  newSelected.delete(friend.id);
                } else {
                  newSelected.add(friend.id);
                }
                setSelectedParticipants(newSelected);
              }}
            />
          ))}
          {errors.participants && <HelperText type="error">{errors.participants}</HelperText>}

          {(splitType === 'EXACT' || splitType === 'PERCENT') && (
            <View style={styles.customSplits}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                {splitType === 'EXACT' ? 'Enter Amounts' : 'Enter Percentages'}
              </Text>
              {Array.from(selectedParticipants).map(participantId => {
                const friend = friends.find(f => f.id === participantId);
                return (
                  <TextInput
                    key={participantId}
                    label={friend?.name || 'You'}
                    value={customSplits[participantId] || ''}
                    onChangeText={(text) => setCustomSplits({
                      ...customSplits,
                      [participantId]: text,
                    })}
                    keyboardType="decimal-pad"
                    style={styles.input}
                  />
                );
              })}
              {errors.splits && <HelperText type="error">{errors.splits}</HelperText>}
            </View>
          )}

          <Provider>
            <Menu
              visible={groupMenuVisible}
              onDismiss={() => setGroupMenuVisible(false)}
              anchor={<Button onPress={() => setGroupMenuVisible(true)}>{selectedGroupId ? selectedGroupId : 'Select Group'}</Button>}
            >
              {groups.map(group => (
                <Menu.Item key={group.id} onPress={() => {
                  setSelectedGroupId(group.id);
                  setGroupMenuVisible(false);
                }} title={group.name} />
              ))}
            </Menu>
          </Provider>

          {errors.submit && <HelperText type="error">{errors.submit}</HelperText>}

          <View style={styles.buttonContainer}>
            <Button onPress={onDismiss} style={styles.button} disabled={isLoading}>Cancel</Button>
            <Button mode="contained" onPress={handleSubmit} style={styles.button} loading={isLoading} disabled={isLoading}>Add</Button>
          </View>
        </ScrollView>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  title: {
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    marginBottom: 12,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  customSplits: {
    marginTop: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  button: {
    marginLeft: 8,
  },
}); 