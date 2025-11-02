import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { TabParamList, BookingStackParamList, SlotStackParamList, ConflictStackParamList, ProfileStackParamList, HomeStackParamList } from './types';

// Placeholder screens - sẽ được implement sau
import KeeperDashboardScreen from '../screens/keeper/KeeperDashboardScreen';
import BookingListScreen from '../screens/booking/BookingListScreen';
import SlotListScreen from '../screens/slot/SlotListScreen';
import ConflictRequestListScreen from '../screens/conflict/ConflictRequestListScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator<TabParamList>();

// Home Stack
const HomeStack = createStackNavigator<HomeStackParamList>();
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen 
        name="Home" 
        component={KeeperDashboardScreen}
        options={{ title: 'Trang chủ' }}
      />
    </HomeStack.Navigator>
  );
}

// Booking Stack
const BookingStack = createStackNavigator<BookingStackParamList>();
function BookingStackNavigator() {
  return (
    <BookingStack.Navigator>
      <BookingStack.Screen 
        name="BookingList" 
        component={BookingListScreen}
        options={{ title: 'Bookings' }}
      />
    </BookingStack.Navigator>
  );
}

// Slot Stack
const SlotStack = createStackNavigator<SlotStackParamList>();
function SlotStackNavigator() {
  return (
    <SlotStack.Navigator>
      <SlotStack.Screen 
        name="SlotList" 
        component={SlotListScreen}
        options={{ title: 'Parking Slots' }}
      />
    </SlotStack.Navigator>
  );
}

// Conflict Stack
const ConflictStack = createStackNavigator<ConflictStackParamList>();
function ConflictStackNavigator() {
  return (
    <ConflictStack.Navigator>
      <ConflictStack.Screen 
        name="ConflictList" 
        component={ConflictRequestListScreen}
        options={{ title: 'Conflict Requests' }}
      />
    </ConflictStack.Navigator>
  );
}

// Profile Stack
const ProfileStack = createStackNavigator<ProfileStackParamList>();
function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </ProfileStack.Navigator>
  );
}

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: '#757575',
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'Trang chủ',
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="BookingTab"
        component={BookingStackNavigator}
        options={{
          tabBarLabel: 'Đặt chỗ',
          tabBarIcon: ({ color, size }) => (
            <Icon name="calendar-check" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="SlotTab"
        component={SlotStackNavigator}
        options={{
          tabBarLabel: 'Slot',
          tabBarIcon: ({ color, size }) => (
            <Icon name="parking" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ConflictTab"
        component={ConflictStackNavigator}
        options={{
          tabBarLabel: 'Xung đột',
          tabBarIcon: ({ color, size }) => (
            <Icon name="alert-circle" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{
          tabBarLabel: 'Hồ sơ',
          tabBarIcon: ({ color, size }) => (
            <Icon name="account" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

