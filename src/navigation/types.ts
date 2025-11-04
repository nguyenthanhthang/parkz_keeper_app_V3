import { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  Splash: undefined;
};

export type BookingStackParamList = {
  BookingList: undefined;
  BookingDetail: { bookingId: number; booking?: any }; // booking is optional fallback data
  CreatePasserbyBooking: undefined;
};

export type SlotStackParamList = {
  SlotList: undefined;
  SlotDetail: { slotId: number };
  ChangeSlot: { bookingId: number };
};

export type ConflictStackParamList = {
  ConflictList: undefined;
};

export type ProfileStackParamList = {
  Profile: undefined;
  BusinessProfile: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
};

export type ParkingStackParamList = {
  ParkingList: undefined;
  ParkingDetail: { parkingId: number };
  CreateEditParking: { parkingId?: number }; // undefined = create, có value = edit
  MapPicker: {
    initialLatitude?: number;
    initialLongitude?: number;
  };
  ScheduleDisable: { parkingId: number };
  DisableHistory: { parkingId: number };
  FloorList: { parkingId: number };
  FloorDetail: { floorId: number };
  CreateEditFloor: { parkingId: number; floorId?: number }; // floorId undefined = create, có value = edit
  CreateEditSlot: { floorId: number; slotId?: number }; // slotId undefined = create, có value = edit
};

export type ManagerBookingStackParamList = {
  ManagerBookingList: undefined;
  ManagerBookingDetail: { bookingId: number };
};

export type KeeperManagementStackParamList = {
  KeeperList: undefined;
  KeeperDetail: { keeperId: number };
  CreateKeeper: undefined;
};

export type PricingStackParamList = {
  PricingList: undefined;
  CreateEditPricing: { parkingPriceId?: number };
  TimelineManagement: { parkingPriceId: number };
  CreateEditTimeline: { parkingPriceId: number; timelineId?: number };
  AssignPriceToParking: undefined;
};

export type StatisticsStackParamList = {
  StatisticsDashboard: undefined;
  RevenueChart: undefined;
  BookingStatistics: undefined;
};

export type ManagerTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  ParkingTab: NavigatorScreenParams<ParkingStackParamList>;
  ManagerBookingTab: NavigatorScreenParams<ManagerBookingStackParamList>;
  PricingTab: NavigatorScreenParams<PricingStackParamList>;
  KeeperManagementTab: NavigatorScreenParams<KeeperManagementStackParamList>;
  StatisticsTab: NavigatorScreenParams<StatisticsStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

export type TabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  BookingTab: NavigatorScreenParams<BookingStackParamList>;
  SlotTab: NavigatorScreenParams<SlotStackParamList>;
  ConflictTab: NavigatorScreenParams<ConflictStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

export type RootStackParamList = {
  Splash: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<TabParamList>;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

