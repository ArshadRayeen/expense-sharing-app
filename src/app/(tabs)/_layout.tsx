import { Tabs } from 'expo-router';
import { FAB, Portal, useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppSelector } from '../../redux/hooks';
import { View, StyleSheet } from 'react-native';

export default function TabLayout() {
  const theme = useTheme();

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarStyle: {
            height: 60,
            paddingBottom: 8,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Activity',
            tabBarIcon: ({ color }) => <Icon name="history" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="friends"
          options={{
            title: 'Friends',
            tabBarIcon: ({ color }) => <Icon name="account-multiple" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="placeholder"
          options={{
            title: '',
            tabBarButton: () => <View style={{ width: 60 }} />,
          }}
        />
        <Tabs.Screen
          name="groups"
          options={{
            title: 'Groups',
            tabBarIcon: ({ color }) => <Icon name="account-group" size={24} color={color} />,
          }}
        />
        <Tabs.Screen
          name="account"
          options={{
            title: 'Account',
            tabBarIcon: ({ color }) => <Icon name="account-circle" size={24} color={color} />,
          }}
        />
      </Tabs>
      {/* <FABComponent /> */}
    </View>
  );
}

function FABComponent() {
  const theme = useTheme();
  
  return (
    <Portal>
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => {/* Handle FAB press */}}
      />
    </Portal>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 65,
    alignSelf: 'center',
  },
}); 