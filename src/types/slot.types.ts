export interface ParkingSlot {
  id: number;
  name: string;
  floorId: number;
  floorName?: string;
  zoneId?: number;
  zoneName?: string;
  status: SlotStatus;
  isDisabled?: boolean;
  disabledReason?: string;
  // Grid layout properties
  rowIndex?: number;
  columnIndex?: number;
  // Booking status properties
  isBooked?: number | boolean; // 0 = false, 1 = true
  isAvailable?: boolean;
  isBackup?: boolean;
  // Booking info (if booked)
  bookingId?: number;
  licensePlate?: string;
  customerName?: string;
  startTime?: string;
  endTime?: string;
}

export enum SlotStatus {
  AVAILABLE = 'Available',
  OCCUPIED = 'Occupied',
  DISABLED = 'Disabled',
  RESERVED = 'Reserved'
}

export interface ChangeSlotRequest {
  bookingId: number;
  newSlotId: number;
}

export interface ChangeSlotComeEarlyRequest {
  bookingId: number;
  newSlotId: number;
}

export interface DisableSlotRequest {
  ParkingSlotId: number;
  Reason: string;
}

export interface EnableSlotRequest {
  ParkingSlotId: number;
}

// Manager Slot Management Types
export interface CreateSlotRequest {
  name: string;
  floorId: number;
  slotType?: 'Car' | 'Moto' | 'Both';
}

export interface UpdateSlotRequest {
  name?: string;
  slotType?: 'Car' | 'Moto' | 'Both';
  status?: SlotStatus;
}

