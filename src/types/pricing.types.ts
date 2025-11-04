export interface ParkingPrice {
  id: number;
  name: string;
  managerId: number;
  managerName?: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateParkingPriceRequest {
  name: string;
  managerId: number;
  description?: string;
}

export interface UpdateParkingPriceRequest {
  name?: string;
  description?: string;
}

export interface DisableEnableParkingPriceRequest {
  parkingPriceId: number;
  isActive: boolean;
}

export interface Timeline {
  id: number;
  parkingPriceId: number;
  parkingPriceName?: string;
  startTime: string; // HH:mm:ss
  endTime: string; // HH:mm:ss
  price: number;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTimelineRequest {
  parkingPriceId: number;
  startTime: string; // HH:mm:ss
  endTime: string; // HH:mm:ss
  price: number;
  description?: string;
}

export interface UpdateTimelineRequest {
  startTime?: string; // HH:mm:ss
  endTime?: string; // HH:mm:ss
  price?: number;
  description?: string;
}

export interface ParkingHasPrice {
  id: number;
  parkingId: number;
  parkingName?: string;
  parkingPriceId: number;
  parkingPriceName?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateParkingHasPriceRequest {
  parkingId: number;
  parkingPriceId: number;
}

export interface UpdateParkingHasPriceRequest {
  parkingPriceId?: number;
  isActive?: boolean;
}

