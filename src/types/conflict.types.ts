export interface ConflictRequest {
  id: number;
  bookingId: number;
  conflictType: string;
  description: string;
  status: ConflictStatus;
  createdAt: string;
  booking?: {
    id: number;
    customerName?: string;
    licensePlate?: string;
    slotName?: string;
  };
}

export enum ConflictStatus {
  PENDING = 'Pending',
  RESOLVED = 'Resolved',
  CANCELLED = 'Cancelled'
}

