import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ManagerDashboardScreen from '../screens/manager/ManagerDashboardScreen';
import ParkingListScreen from '../screens/manager/ParkingListScreen';
import ParkingDetailScreen from '../screens/manager/ParkingDetailScreen';
import CreateEditParkingScreen from '../screens/manager/CreateEditParkingScreen';
import MapPickerScreen from '../components/map/MapPickerScreen';
import ScheduleDisableParkingScreen from '../screens/manager/ScheduleDisableParkingScreen';
import DisableHistoryScreen from '../screens/manager/DisableHistoryScreen';
import FloorListScreen from '../screens/manager/FloorListScreen';
import FloorDetailScreen from '../screens/manager/FloorDetailScreen';
import CreateEditFloorScreen from '../screens/manager/CreateEditFloorScreen';
import CreateEditSlotScreen from '../screens/manager/CreateEditSlotScreen';
import ManagerBookingListScreen from '../screens/manager/ManagerBookingListScreen';
import ManagerBookingDetailScreen from '../screens/manager/ManagerBookingDetailScreen';
import PricingListScreen from '../screens/manager/PricingListScreen';
import CreateEditPricingScreen from '../screens/manager/CreateEditPricingScreen';
import TimelineManagementScreen from '../screens/manager/TimelineManagementScreen';
import CreateEditTimelineScreen from '../screens/manager/CreateEditTimelineScreen';
import AssignPriceToParkingScreen from '../screens/manager/AssignPriceToParkingScreen';
import KeeperListScreen from '../screens/manager/KeeperListScreen';
import KeeperDetailScreen from '../screens/manager/KeeperDetailScreen';
import CreateKeeperScreen from '../screens/manager/CreateKeeperScreen';
import StatisticsDashboardScreen from '../screens/manager/StatisticsDashboardScreen';
import RevenueChartScreen from '../screens/manager/RevenueChartScreen';
import BookingStatisticsScreen from '../screens/manager/BookingStatisticsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import BusinessProfileScreen from '../screens/manager/BusinessProfileScreen';
import { 
  ParkingStackParamList, 
  HomeStackParamList, 
  ProfileStackParamList, 
  ManagerBookingStackParamList,
  PricingStackParamList,
  KeeperManagementStackParamList,
  StatisticsStackParamList
} from './types';

const Tab = createBottomTabNavigator();
const ParkingStack = createStackNavigator<ParkingStackParamList>();
const HomeStack = createStackNavigator<HomeStackParamList>();
const ProfileStack = createStackNavigator<ProfileStackParamList>();
const ManagerBookingStack = createStackNavigator<ManagerBookingStackParamList>();
const PricingStack = createStackNavigator<PricingStackParamList>();
const KeeperManagementStack = createStackNavigator<KeeperManagementStackParamList>();
const StatisticsStack = createStackNavigator<StatisticsStackParamList>();

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

// Manager Booking Stack Navigator
function ManagerBookingStackNavigator() {
  return (
    <ManagerBookingStack.Navigator>
      <ManagerBookingStack.Screen
        name="ManagerBookingList"
        component={ManagerBookingListScreen}
        options={{ title: 'Danh sách booking' }}
      />
      <ManagerBookingStack.Screen
        name="ManagerBookingDetail"
        component={ManagerBookingDetailScreen}
        options={{ title: 'Chi tiết booking' }}
      />
    </ManagerBookingStack.Navigator>
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
      <ParkingStack.Screen
        name="ScheduleDisable"
        component={ScheduleDisableParkingScreen}
        options={{ title: 'Lên lịch vô hiệu hóa' }}
      />
      <ParkingStack.Screen
        name="DisableHistory"
        component={DisableHistoryScreen}
        options={{ title: 'Lịch sử vô hiệu hóa' }}
      />
      <ParkingStack.Screen
        name="FloorList"
        component={FloorListScreen}
        options={{ title: 'Danh sách tầng' }}
      />
      <ParkingStack.Screen
        name="FloorDetail"
        component={FloorDetailScreen}
        options={{ title: 'Chi tiết tầng' }}
      />
      <ParkingStack.Screen
        name="CreateEditFloor"
        component={CreateEditFloorScreen}
        options={({ route }) => ({
          title: route.params?.floorId ? 'Chỉnh sửa tầng' : 'Tạo tầng mới',
        })}
      />
      <ParkingStack.Screen
        name="CreateEditSlot"
        component={CreateEditSlotScreen}
        options={({ route }) => ({
          title: route.params?.slotId ? 'Chỉnh sửa vị trí' : 'Tạo vị trí mới',
        })}
      />
    </ParkingStack.Navigator>
  );
}

// Pricing Stack Navigator
function PricingStackNavigator() {
  return (
    <PricingStack.Navigator>
      <PricingStack.Screen
        name="PricingList"
        component={PricingListScreen}
        options={{ title: 'Danh sách bảng giá' }}
      />
      <PricingStack.Screen
        name="CreateEditPricing"
        component={CreateEditPricingScreen}
        options={({ route }) => ({
          title: route.params?.parkingPriceId ? 'Chỉnh sửa bảng giá' : 'Tạo bảng giá mới',
        })}
      />
      <PricingStack.Screen
        name="TimelineManagement"
        component={TimelineManagementScreen}
        options={{ title: 'Quản lý timeline' }}
      />
      <PricingStack.Screen
        name="CreateEditTimeline"
        component={CreateEditTimelineScreen}
        options={({ route }) => ({
          title: route.params?.timelineId ? 'Chỉnh sửa timeline' : 'Tạo timeline mới',
        })}
      />
      <PricingStack.Screen
        name="AssignPriceToParking"
        component={AssignPriceToParkingScreen}
        options={{ title: 'Gán giá cho bãi đỗ' }}
      />
    </PricingStack.Navigator>
  );
}

// Keeper Management Stack Navigator
function KeeperManagementStackNavigator() {
  return (
    <KeeperManagementStack.Navigator>
      <KeeperManagementStack.Screen
        name="KeeperList"
        component={KeeperListScreen}
        options={{ title: 'Danh sách keeper' }}
      />
      <KeeperManagementStack.Screen
        name="KeeperDetail"
        component={KeeperDetailScreen}
        options={{ title: 'Chi tiết keeper' }}
      />
      <KeeperManagementStack.Screen
        name="CreateKeeper"
        component={CreateKeeperScreen}
        options={{ title: 'Tạo keeper mới' }}
      />
    </KeeperManagementStack.Navigator>
  );
}

// Statistics Stack Navigator
function StatisticsStackNavigator() {
  return (
    <StatisticsStack.Navigator>
      <StatisticsStack.Screen
        name="StatisticsDashboard"
        component={StatisticsDashboardScreen}
        options={{ title: 'Thống kê' }}
      />
      <StatisticsStack.Screen
        name="RevenueChart"
        component={RevenueChartScreen}
        options={{ title: 'Biểu đồ doanh thu' }}
      />
      <StatisticsStack.Screen
        name="BookingStatistics"
        component={BookingStatisticsScreen}
        options={{ title: 'Thống kê booking' }}
      />
    </StatisticsStack.Navigator>
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
            <MaterialCommunityIcons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ParkingTab"
        component={ParkingStackNavigator}
        options={{
          tabBarLabel: 'Bãi đỗ',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="parking" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="BookingTab"
        component={ManagerBookingStackNavigator}
        options={{
          tabBarLabel: 'Đặt chỗ',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="calendar-check" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="KeeperTab"
        component={KeeperManagementStackNavigator}
        options={{
          tabBarLabel: 'Nhân viên',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account-group" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="PricingTab"
        component={PricingStackNavigator}
        options={{
          tabBarLabel: 'Bảng giá',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="currency-usd" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="StatisticsTab"
        component={StatisticsStackNavigator}
        options={{
          tabBarLabel: 'Thống kê',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chart-bar" size={size} color={color} />
          ),
        }}
      />
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

