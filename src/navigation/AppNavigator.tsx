import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ParamListBase, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationOptions } from '@react-navigation/native-stack';

// Import screens
import WelcomeScreen from '../screens/WelcomeScreen';
import LandingScreen from '../screens/LandingScreen';
import RecentActivityScreen from '../screens/RecentActivityScreen';
import FriendsScreen from '../screens/FriendsScreen';
import GroupDetailScreen from '../screens/GroupDetailScreen';
import AccountScreen from '../screens/AccountScreen';
import SettlementScreen from '../screens/SettlementScreen';
import ExpenseDetailScreen from '../components/expense/ExpenseDetailScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

// Add type for route params
interface GroupDetailParams {
  groupName: string;
}

// Extend ParamList to include our screen params
type RootStackParamList = {
  Welcome: undefined;
  Landing: undefined;
  Dashboard: undefined;
  Settlement: undefined;
  ExpenseDetail: undefined;
  GroupDetail: GroupDetailParams;
};

// Bottom tab navigator for the main app screens
const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'list-outline';

          if (route.name === 'Activity') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Friends') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Groups') {
            iconName = focused ? 'people-circle' : 'people-circle-outline';
          } else if (route.name === 'Account') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#1E88E5',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen 
        name="Activity" 
        component={RecentActivityScreen} 
        options={{ title: 'Recent Activity' }}
      />
      <Tab.Screen 
        name="Friends" 
        component={FriendsScreen} 
      />
      <Tab.Screen 
        name="Account" 
        component={AccountScreen} 
      />
    </Tab.Navigator>
  );
};

// Main stack navigator
const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Welcome">
      <Stack.Screen 
        name="Welcome" 
        component={WelcomeScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="Landing" 
        component={LandingScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="Dashboard" 
        component={BottomTabNavigator} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="Settlement" 
        component={SettlementScreen} 
        options={{ title: 'Record Settlement' }} 
      />
      <Stack.Screen 
        name="ExpenseDetail" 
        component={ExpenseDetailScreen} 
        options={{ title: 'Expense Details' }} 
      />
      <Stack.Screen 
        name="GroupDetail" 
        component={GroupDetailScreen} 
        options={({ route }) => ({ 
          title: route.params?.groupName || 'Group Details' 
        })} 
      />
    </Stack.Navigator>
  );
};

export default AppNavigator; 