import { Stack } from 'expo-router';
import AccountScreen from '../../screens/AccountScreen';

export default function AccountTab() {
  return (
    <>
      <Stack.Screen options={{ title: 'Account' }} />
      <AccountScreen />
    </>
  );
} 