import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TabParamList, BookingStackParamList, SlotStackParamList, ConflictStackParamList, ProfileStackParamList, HomeStackParamList } from './types';

// Keeper screens
import KeeperDashboardScreen from '../screens/keeper/KeeperDashboardScreen';
import BookingListScreen from '../screens/booking/BookingListScreen';
import CreatePasserbyBookingScreen from '../screens/booking/CreatePasserbyBookingScreen';
import BookingDetailScreen from '../screens/booking/BookingDetailScreen';
import SlotListScreen from '../screens/slot/SlotListScreen';
import ParkingMapScreen from '../screens/keeper/ParkingMapScreen';
import ConflictRequestListScreen from '../screens/conflict/ConflictRequestListScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator<TabParamList>();

// Home Stack
const HomeStack = createStackNavigator<HomeStackParamList>();
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#6200ee',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
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
    <BookingStack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#6200ee',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <BookingStack.Screen 
        name="BookingList" 
        component={BookingListScreen}
        options={{ title: 'Danh sách đặt chỗ' }}
      />
      <BookingStack.Screen 
        name="CreatePasserbyBooking" 
        component={CreatePasserbyBookingScreen}
        options={{ title: 'Tạo đặt chỗ cho khách vãng lai' }}
      />
      <BookingStack.Screen 
        name="BookingDetail" 
        component={BookingDetailScreen}
        options={{ title: 'Chi tiết đặt chỗ' }}
      />
    </BookingStack.Navigator>
  );
}

// Parking Map (Slot) Stack
const SlotStack = createStackNavigator<SlotStackParamList>();
function SlotStackNavigator() {
  return (
    <SlotStack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#6200ee',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <SlotStack.Screen 
        name="SlotList" 
        component={ParkingMapScreen}
        options={{ title: 'Bản đồ bãi' }}
      />
    </SlotStack.Navigator>
  );
}

// Conflict Stack
const ConflictStack = createStackNavigator<ConflictStackParamList>();
function ConflictStackNavigator() {
  return (
    <ConflictStack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#6200ee',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
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
    <ProfileStack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: '#6200ee',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
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
      {/* Dashboard */}
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" size={size} color={color} />
          ),
        }}
      />
      {/* Parking Map */}
      <Tab.Screen
        name="SlotTab"
        component={SlotStackNavigator}
        options={{
          tabBarLabel: 'Bản đồ bãi',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="parking" size={size} color={color} />
          ),
        }}
      />
      {/* Bookings */}
      <Tab.Screen
        name="BookingTab"
        component={BookingStackNavigator}
        options={{
          tabBarLabel: 'Đặt chỗ',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="calendar-check" size={size} color={color} />
          ),
        }}
      />
      {/* Tạm thời ẩn tab Xung đột
      <Tab.Screen
        name="ConflictTab"
        component={ConflictStackNavigator}
        options={{
          tabBarLabel: 'Xung đột',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="alert-circle" size={size} color={color} />
          ),
        }}
      />
      */}
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{
          tabBarLabel: 'Hồ sơ',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

