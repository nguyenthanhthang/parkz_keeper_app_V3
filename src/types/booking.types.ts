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

export interface CreateBookingForPasserbyRequest {
  BookingForPasserby: {
    ParkingSlotId: number;
    EndTime: string;
    DateBook: string;
    GuestName?: string;
    GuestPhone?: string;
  };
  VehicleInformationForPasserby: {
    LicensePlate?: string;
    VehicleName?: string;
    Color?: string;
    TrafficId?: number;
  };
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

