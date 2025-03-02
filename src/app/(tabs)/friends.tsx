import { Stack } from 'expo-router';
import FriendsScreen from '../../screens/FriendsScreen';

export default function FriendsTab() {
  return (
    <>
      <Stack.Screen options={{ title: 'Friends' }} />
      <FriendsScreen />
    </>
  );
} 