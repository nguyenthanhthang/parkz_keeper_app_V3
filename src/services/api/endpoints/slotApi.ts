import { apiClient } from '../apiClient';
import { API_ENDPOINTS } from '../../../utils/constants';
import {
  ParkingSlot,
  CreateSlotRequest,
  UpdateSlotRequest,
  ServiceResponse,
} from '../../../types';

export const slotApi = {
  /**
   * Lấy danh sách slot theo floor ID
   * Endpoint: GET /api/parkingSlot/floor/{floorId}
   */
  async getSlotsByFloor(floorId: number): Promise<ParkingSlot[]> {
    const response: any = await apiClient.get(
      `${API_ENDPOINTS.GET_SLOTS_BY_FLOOR}/${floorId}`
    );

    const isSuccess = response?.success || response?.isSuccess;
    if (isSuccess && response?.data) {
      // Unwrap nested data structure
      const data = response.data?.data ?? response.data;
      return Array.isArray(data) ? data : [];
    }

    throw new Error(response?.message || 'Failed to get slots by floor');
  },

  /**
   * Tạo slot mới
   * Endpoint: POST /api/parkingSlot/create
   */
  async createSlot(data: CreateSlotRequest): Promise<ParkingSlot> {
    const response: any = await apiClient.post(API_ENDPOINTS.CREATE_SLOT, data);

    const isSuccess = response?.success || response?.isSuccess;
    if (isSuccess && response?.data) {
      // Unwrap nested data structure
      const unwrappedData = response.data?.data ?? response.data;
      return unwrappedData;
    }

    throw new Error(response?.message || 'Failed to create slot');
  },

  /**
   * Cập nhật slot
   * Endpoint: PUT /api/parkingSlot
   */
  async updateSlot(slotId: number, data: UpdateSlotRequest): Promise<ParkingSlot> {
    // Note: API có thể yêu cầu slotId trong body hoặc URL, cần kiểm tra API spec
    const response: any = await apiClient.put(API_ENDPOINTS.UPDATE_SLOT, { ...data, id: slotId });

    const isSuccess = response?.success || response?.isSuccess;
    if (isSuccess && response?.data) {
      // Unwrap nested data structure
      const unwrappedData = response.data?.data ?? response.data;
      return unwrappedData;
    }

    throw new Error(response?.message || 'Failed to update slot');
  },
};

