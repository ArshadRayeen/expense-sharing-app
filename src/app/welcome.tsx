import { Stack } from 'expo-router';
import WelcomeScreen from '../screens/WelcomeScreen';

export default function Welcome() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <WelcomeScreen />
    </>
  );
} 