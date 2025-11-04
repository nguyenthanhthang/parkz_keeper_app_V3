import { apiClient } from '../apiClient';
import { API_ENDPOINTS } from '../../../utils/constants';

// Types
export interface ChangeSlotRequest {
  bookingId: number;
  newSlotId: number;
}

export interface AvailableSlot {
  id: number;
  name: string;
  floorId: number;
  floorName?: string;
  vehicleTypeId: number;
  vehicleTypeName?: string;
  status: string;
}

export interface GetAvailableSlotsParams {
  floorId: number;
  startTime: string; // yyyy-MM-ddTHH:mm:ss
  endTime: string; // yyyy-MM-ddTHH:mm:ss
  vehicleId: number;
}

export interface DisableSlotRequest {
  parkingSlotId: number;
  reason: string;
}

export interface EnableSlotRequest {
  parkingSlotId: number;
}

// API Functions
export const keeperSlotApi = {
  /**
   * Đổi slot cho khách
   */
  changeSlot: async (data: ChangeSlotRequest): Promise<void> => {
    const response = await apiClient.put(API_ENDPOINTS.CHANGE_SLOT, data);
    return response.data;
  },

  /**
   * Đổi slot khi khách đến sớm
   */
  changeSlotComeEarly: async (data: ChangeSlotRequest): Promise<void> => {
    const response = await apiClient.put(
      API_ENDPOINTS.CHANGE_SLOT_COME_EARLY,
      data
    );
    return response.data;
  },

  /**
   * Lấy danh sách slot trống theo floor (cho booking có sẵn)
   */
  getAvailableSlots: async (
    params: GetAvailableSlotsParams
  ): Promise<AvailableSlot[]> => {
    const { floorId, startTime, endTime, vehicleId } = params;
    const response = await apiClient.get<AvailableSlot[]>(
      API_ENDPOINTS.GET_AVAILABLE_SLOTS,
      {
        params: {
          FloorId: floorId,
          StartTime: startTime,
          EndTime: endTime,
          VehicleId: vehicleId,
        },
      }
    );
    return response.data || [];
  },

  /**
   * Lấy danh sách slot trống theo floor (cho passerby - khách vãng lai)
   */
  getAvailableSlotsForPasserby: async (
    params: GetAvailableSlotsParams
  ): Promise<AvailableSlot[]> => {
    const { floorId, startTime, endTime, vehicleId } = params;
    const response = await apiClient.get<AvailableSlot[]>(
      API_ENDPOINTS.GET_AVAILABLE_SLOTS_PASSERBY,
      {
        params: {
          FloorId: floorId,
          StartTime: startTime,
          EndTime: endTime,
          VehicleId: vehicleId,
        },
      }
    );
    return response.data || [];
  },

  /**
   * Vô hiệu hóa slot
   */
  disableSlot: async (data: DisableSlotRequest): Promise<void> => {
    const response = await apiClient.post(API_ENDPOINTS.DISABLE_SLOT, data);
    return response.data;
  },

  /**
   * Kích hoạt slot
   */
  enableSlot: async (data: EnableSlotRequest): Promise<void> => {
    const response = await apiClient.put(API_ENDPOINTS.ENABLE_SLOT, data);
    return response.data;
  },
};
