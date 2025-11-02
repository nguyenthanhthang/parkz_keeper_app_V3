import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import ManagerDashboardScreen from '../screens/manager/ManagerDashboardScreen';
import ParkingListScreen from '../screens/manager/ParkingListScreen';
import ParkingDetailScreen from '../screens/manager/ParkingDetailScreen';
import CreateEditParkingScreen from '../screens/manager/CreateEditParkingScreen';
import MapPickerScreen from '../components/map/MapPickerScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import BusinessProfileScreen from '../screens/manager/BusinessProfileScreen';
import { ParkingStackParamList, HomeStackParamList, ProfileStackParamList } from './types';

// Placeholder screens - sẽ được implement theo plan
const BookingPlaceholder = () => null;
const KeeperPlaceholder = () => null;
const StatisticsPlaceholder = () => null;

const Tab = createBottomTabNavigator();
const ParkingStack = createStackNavigator<ParkingStackParamList>();
const HomeStack = createStackNavigator<HomeStackParamList>();
const ProfileStack = createStackNavigator<ProfileStackParamList>();

// Home Stack Navigator
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        name="Home"
        component={ManagerDashboardScreen}
        options={{ title: 'Trang chủ' }}
      />
    </HomeStack.Navigator>
  );
}

// Profile Stack Navigator
function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator>
      <ProfileStack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Hồ sơ' }}
      />
      <ProfileStack.Screen
        name="BusinessProfile"
        component={BusinessProfileScreen}
        options={{ title: 'Hồ sơ Doanh nghiệp' }}
      />
    </ProfileStack.Navigator>
  );
}

// Parking Stack Navigator
function ParkingStackNavigator() {
  return (
    <ParkingStack.Navigator>
      <ParkingStack.Screen
        name="ParkingList"
        component={ParkingListScreen}
        options={{ title: 'Bãi đỗ' }}
      />
      <ParkingStack.Screen
        name="ParkingDetail"
        component={ParkingDetailScreen}
        options={{ title: 'Chi tiết bãi đỗ' }}
      />
      <ParkingStack.Screen
        name="CreateEditParking"
        component={CreateEditParkingScreen}
        options={({ route }) => ({
          title: route.params?.parkingId ? 'Chỉnh sửa bãi đỗ' : 'Tạo bãi đỗ mới',
        })}
      />
      <ParkingStack.Screen
        name="MapPicker"
        component={MapPickerScreen}
        options={{ title: 'Chọn vị trí' }}
      />
    </ParkingStack.Navigator>
  );
}

export default function ManagerNavigator() {
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
        name="ParkingTab"
        component={ParkingStackNavigator}
        options={{
          tabBarLabel: 'Bãi đỗ',
          tabBarIcon: ({ color, size }) => (
            <Icon name="parking" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="BookingTab"
        component={BookingPlaceholder}
        options={{
          tabBarLabel: 'Đặt chỗ',
          tabBarIcon: ({ color, size }) => (
            <Icon name="calendar-check" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="KeeperTab"
        component={KeeperPlaceholder}
        options={{
          tabBarLabel: 'Nhân viên',
          tabBarIcon: ({ color, size }) => (
            <Icon name="account-group" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="StatisticsTab"
        component={StatisticsPlaceholder}
        options={{
          tabBarLabel: 'Thống kê',
          tabBarIcon: ({ color, size }) => (
            <Icon name="chart-bar" size={size} color={color} />
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

