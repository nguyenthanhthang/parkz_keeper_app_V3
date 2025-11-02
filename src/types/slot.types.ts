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

