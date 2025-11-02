export interface Parking {
  id: number;
  name: string;
  address: string;
  description?: string;
  motoSpot?: number; // Số slot xe máy
  carSpot?: number; // Số slot xe ô tô
  latitude?: number;
  longitude?: number;
  totalSlots?: number;
  availableSlots?: number;
  isActive: boolean;
  isFull?: boolean;
  isPrepayment?: boolean; // Có thanh toán trả trước
  isOvernight?: boolean; // Có áp dụng qua đêm
  managerId?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateParkingRequest {
  name: string; // Required, max 50 chars, unique
  address: string; // Required, max 250 chars
  description: string; // Required, max 250 chars
  motoSpot: number; // Required, >= 0 - Số slot xe máy
  carSpot: number; // Required, >= 0 - Số slot xe ô tô
  isPrepayment: boolean; // Required - Có thanh toán trả trước
  isOvernight: boolean; // Required - Có áp dụng qua đêm
  managerId: number; // Required - ID Manager
}

export interface UpdateParkingRequest {
  Name?: string;
  Address?: string;
  Description?: string;
  Latitude?: number;
  Longitude?: number;
  IsPrepayment?: boolean;
  IsOvernight?: boolean;
}

export interface UpdateParkingLocationRequest {
  latitude: number;
  longitude: number;
}

export interface DisableParkingByDateRequest {
  parkingId: number;
  startDate: string; // yyyy-MM-dd
  endDate: string; // yyyy-MM-dd
  reason?: string;
}

export interface DisableParkingByDateTimeRequest {
  parkingId: number;
  startDate: string; // yyyy-MM-dd
  endDate: string; // yyyy-MM-dd
  startTime: string; // HH:mm:ss
  endTime: string; // HH:mm:ss
  reason?: string;
}

export interface EnableDisableParkingAtDateRequest {
  parkingId: number;
  date: string; // yyyy-MM-dd
  isDisable: boolean; // true = disable, false = enable
  reason?: string;
}

export interface CancelDisableScheduledRequest {
  parkingId: number;
  scheduledId?: number; // ID của scheduled disable (nếu có)
}

export interface ScheduledDisableHistory {
  id: number;
  parkingId: number;
  parkingName?: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  reason?: string;
  createdAt?: string;
}

export interface SuccessedDisableHistory {
  id: number;
  parkingId: number;
  parkingName?: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  endTime?: string;
  reason?: string;
  createdAt?: string;
  completedAt?: string;
}

export enum ParkingStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  FULL = 'Full',
  DISABLED = 'Disabled',
}
