import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, RadioButton, TextInput } from 'react-native-paper';
import { SplitType } from '../../types';

interface SplitInputProps {
  splitType: SplitType;
  onSplitTypeChange: (type: SplitType) => void;
  participants: string[];
  amount: number;
  onExactAmountsChange: (amounts: Record<string, string>) => void;
  onPercentagesChange: (percentages: Record<string, string>) => void;
  exactAmounts: Record<string, string>;
  percentages: Record<string, string>;
}

const SplitInput = ({
  splitType,
  onSplitTypeChange,
  participants,
  amount,
  onExactAmountsChange,
  onPercentagesChange,
  exactAmounts,
  percentages,
}: SplitInputProps) => {
  const [totalExact, setTotalExact] = useState(0);
  const [totalPercent, setTotalPercent] = useState(0);

  useEffect(() => {
    // Calculate totals when inputs change
    let exactTotal = 0;
    let percentTotal = 0;

    for (const amountStr of Object.values(exactAmounts)) {
      exactTotal += parseFloat(amountStr) || 0;
    }

    for (const percentStr of Object.values(percentages)) {
      percentTotal += parseFloat(percentStr) || 0;
    }

    setTotalExact(exactTotal);
    setTotalPercent(percentTotal);
  }, [exactAmounts, percentages]);

  const handleExactAmountChange = (userId: string, value: string) => {
    const newAmounts = { ...exactAmounts, [userId]: value };
    onExactAmountsChange(newAmounts);
  };

  const handlePercentageChange = (userId: string, value: string) => {
    const newPercentages = { ...percentages, [userId]: value };
    onPercentagesChange(newPercentages);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Split Type</Text>
      
      <RadioButton.Group onValueChange={(value) => onSplitTypeChange(value as SplitType)} value={splitType}>
        <RadioButton.Item label="Equal" value={SplitType.EQUAL} />
        <RadioButton.Item label="Exact Amounts" value={SplitType.EXACT} />
        <RadioButton.Item label="Percentages" value={SplitType.PERCENT} />
      </RadioButton.Group>
      
      {splitType === SplitType.EQUAL && (
        <Text style={styles.infoText}>
          Each person pays: ₹{(amount / participants.length).toFixed(2)}
        </Text>
      )}
      
      {splitType === SplitType.EXACT && (
        <View style={styles.inputsContainer}>
          {participants.map((userId) => (
            <TextInput
              key={`exact-${userId}`}
              label={`Amount for ${userId}`}
              value={exactAmounts[userId] || ''}
              onChangeText={(text) => handleExactAmountChange(userId, text)}
              keyboardType="numeric"
              style={styles.input}
            />
          ))}
          <Text style={[
            styles.totalText, 
            Math.abs(totalExact - amount) > 0.01 ? styles.error : {}
          ]}>
            Total: ₹{totalExact.toFixed(2)} / ₹{amount.toFixed(2)}
          </Text>
        </View>
      )}
      
      {splitType === SplitType.PERCENT && (
        <View style={styles.inputsContainer}>
          {participants.map((userId) => (
            <TextInput
              key={`percent-${userId}`}
              label={`Percentage for ${userId}`}
              value={percentages[userId] || ''}
              onChangeText={(text) => handlePercentageChange(userId, text)}
              keyboardType="numeric"
              style={styles.input}
              right={<TextInput.Affix text="%" />}
            />
          ))}
          <Text style={[
            styles.totalText, 
            Math.abs(totalPercent - 100) > 0.01 ? styles.error : {}
          ]}>
            Total: {totalPercent.toFixed(2)}% / 100%
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  inputsContainer: {
    marginTop: 10,
  },
  input: {
    marginBottom: 10,
  },
  infoText: {
    marginTop: 10,
    fontSize: 14,
    color: '#1E88E5',
  },
  totalText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 5,
  },
  error: {
    color: 'red',
  },
});

export default SplitInput; 