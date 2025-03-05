import { useEffect, useState } from 'react';
import { initDb } from './services/db';
import { LoadingScreen } from './components/common/LoadingScreen';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './redux/store';
import { PaperProvider } from 'react-native-paper';
import { Stack } from 'expo-router';
import { View, Text } from 'react-native';
import { useAppDispatch, useAppSelector } from './redux/hooks';
import { loadUserData } from './redux/slices/userDataSlice';

function AppContent() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);

  useEffect(() => {
    const initialize = async () => {
      try {
        await initDb();
        
        // If user exists in persisted state, load their data
        if (user) {
          await dispatch(loadUserData(user.id));
        }
        
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize:', error);
        setError(error instanceof Error ? error.message : 'Failed to initialize');
      }
    };

    initialize();
  }, [user?.id]); // Depend on user.id to reload data if user changes

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

  return <Stack />;
}

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        <PaperProvider>
          <AppContent />
        </PaperProvider>
      </PersistGate>
    </Provider>
  );
} 