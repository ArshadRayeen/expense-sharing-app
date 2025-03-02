import { Stack } from 'expo-router';
import RecentActivityScreen from '../../screens/RecentActivityScreen';

export default function ActivityTab() {
  return (
    <>
      <Stack.Screen options={{ title: 'Recent Activity' }} />
      <RecentActivityScreen />
    </>
  );
} 