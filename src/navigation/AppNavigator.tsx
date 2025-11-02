import React, { useEffect, useMemo } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';
import SplashScreen from '../screens/auth/SplashScreen';
import AuthNavigator from './AuthNavigator';
import TabNavigator from './TabNavigator';
import ManagerNavigator from './ManagerNavigator';

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const { isAuthenticated, isLoading, checkAuth, user } = useAuth();

  useEffect(() => {
    // Check authentication status on app start - only once
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Determine which navigator to show based on user role
  const MainNavigator = useMemo(() => {
    if (!user) return TabNavigator; // Default to Keeper tabs
    
    const userRole = user.role as string;
    if (userRole === UserRole.MANAGER || userRole === 'Manager') {
      return ManagerNavigator;
    }
    return TabNavigator; // Keeper tabs
  }, [user]);

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
        initialRouteName="Splash"
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Auth" component={AuthNavigator} />
        <Stack.Screen name="Main" component={MainNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

