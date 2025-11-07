export interface Booking {
  id: number;
  parkingSlotId: number;
  slotName?: string;
  customerName?: string;
  customerPhone?: string;
  licensePlate?: string;
  vehicleName?: string;
  vehicleColor?: string;
  startTime: string;
  endTime: string;
  dateBook: string;
  status: BookingStatus;
  createdAt?: string;
}

export enum BookingStatus {
  PENDING = 'Pending',
  CONFIRMED = 'Confirmed',
  IN_PROGRESS = 'InProgress',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled'
}

// API spec: POST /api/booking-management-for-keeper/create/passerby
// Request format: flat structure (not nested)
export interface CreateBookingForPasserbyRequest {
  parkingSlotId: number;
  vehicleId: number;
  startTime: string; // Format: "2024-01-15T08:00:00"
  endTime: string; // Format: "2024-01-15T18:00:00"
  guestName: string;
  guestPhone: string;
  guestLicensePlate: string;
}

export interface BookingFilter {
  date?: string;
  status?: BookingStatus;
  searchString?: string;
}

export interface BookingPagination {
  pageNo: number;
  pageSize: number;
  hasMore: boolean;
}

// Manager Booking Management Types
export interface ApproveBookingRequest {
  bookingId: number;
  approved?: boolean; // Optional, default true
}

export interface CheckInBookingRequest {
  bookingId: number;
}

export interface CheckoutBookingRequest {
  bookingId: number;
  parkingId: number;
  totalPrice?: number | null;
  paymentMethod?: 'tien mat' | 'online' | null;
}

export interface MarkBookingDoneRequest {
  bookingId: number;
}

export interface ManagerBookingFilter {
  status?: BookingStatus;
  date?: string; // yyyy-MM-dd
  parkingId?: number;
  pageNo?: number;
  pageSize?: number;
}

