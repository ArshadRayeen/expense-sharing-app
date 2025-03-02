import { Stack } from 'expo-router';
import LandingScreen from '../../screens/LandingScreen';

export default function Login() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LandingScreen />
    </>
  );
} 