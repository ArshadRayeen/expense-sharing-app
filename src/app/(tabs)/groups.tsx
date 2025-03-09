import { Stack } from 'expo-router';
import GroupScreen from '../../screens/GroupsScreen';

export default function GroupsTab() {
  return (
    <>
      <Stack.Screen options={{ title: 'Groups' }} />
      <GroupScreen />
    </>
  );
} 