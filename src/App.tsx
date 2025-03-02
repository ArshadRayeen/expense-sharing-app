import { useEffect, useState } from 'react';
import { initDb } from './services/db';
import { LoadingScreen } from './components/common/LoadingScreen';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { PaperProvider } from 'react-native-paper';
import { Stack } from 'expo-router';
import { View, Text } from 'react-native';

export default function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const setupDatabase = async () => {
      try {
        await initDb();
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize database:', error);
        setError(error instanceof Error ? error.message : 'Failed to initialize database');
      }
    };

    setupDatabase();
  }, []);

  if (!isInitialized) {
    return <LoadingScreen />;
  }

  if (error) {
    // You might want to create a proper error screen component
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Error: {error}</Text>
      </View>
    );
  }

  return (
    <Provider store={store}>
      <PaperProvider>
        <Stack>
          {/* Your app routes */}
        </Stack>
      </PaperProvider>
    </Provider>
  );
} 