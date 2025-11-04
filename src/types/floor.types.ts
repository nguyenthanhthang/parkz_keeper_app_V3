export interface Floor {
  id: number;
  name: string;
  parkingId: number;
  parkingName?: string;
  description?: string;
  totalSlots?: number;
  availableSlots?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateFloorRequest {
  name: string;
  parkingId: number;
  description?: string;
}

export interface UpdateFloorRequest {
  name?: string;
  description?: string;
}

