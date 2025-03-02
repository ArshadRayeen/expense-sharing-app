import { Stack } from 'expo-router';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from '../redux/store';

export default function RootLayout() {
  return (
    <ReduxProvider store={store}>
      <PaperProvider>
        <Stack
          screenOptions={{
            headerShown: false,
          }}
        />
      </PaperProvider>
    </ReduxProvider>
  );
} 