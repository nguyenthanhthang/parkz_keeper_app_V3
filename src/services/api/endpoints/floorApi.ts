import { apiClient } from '../apiClient';
import { API_ENDPOINTS } from '../../../utils/constants';
import {
  Floor,
  CreateFloorRequest,
  UpdateFloorRequest,
  ServiceResponse,
} from '../../../types';

export const floorApi = {
  /**
   * Lấy danh sách tất cả tầng (có thể filter theo parkingId)
   * Endpoint: GET /api/floors?parkingId={parkingId}
   */
  async getAllFloors(parkingId?: number): Promise<Floor[]> {
    const params = parkingId ? { parkingId } : {};
    const response = await apiClient.get<any>(
      API_ENDPOINTS.GET_ALL_FLOORS,
      { params }
    );
    const isSuccess = (response as any)?.isSuccess || (response as any)?.success;
    const data = (response as any)?.data?.data ?? (response as any)?.data;
    if (isSuccess && data) {
      return data as Floor[];
    }
    throw new Error((response as any)?.message || 'Failed to get floors');
  },

  /**
   * Lấy danh sách tầng theo parking ID
   * Endpoint: GET /api/floors/parking/{parkingId}
   */
  async getFloorsByParking(parkingId: number): Promise<Floor[]> {
    const response = await apiClient.get<any>(
      `${API_ENDPOINTS.GET_FLOORS_BY_PARKING}/${parkingId}`
    );
    const isSuccess = (response as any)?.isSuccess || (response as any)?.success;
    const data = (response as any)?.data?.data ?? (response as any)?.data;
    if (isSuccess && data) {
      return data as Floor[];
    }
    throw new Error((response as any)?.message || 'Failed to get floors by parking');
  },

  /**
   * Tạo tầng mới
   * Endpoint: POST /api/floors/floor
   */
  async createFloor(data: CreateFloorRequest): Promise<Floor> {
    const response = await apiClient.post<ServiceResponse<Floor>>(
      API_ENDPOINTS.CREATE_FLOOR,
      data
    );

    if (response && response.isSuccess && response.data) {
      return response.data;
    }

    throw new Error(response?.message || 'Failed to create floor');
  },

  /**
   * Cập nhật thông tin tầng
   * Endpoint: PUT /api/floors/floor/{floorId}
   */
  async updateFloor(floorId: number, data: UpdateFloorRequest): Promise<Floor> {
    const response = await apiClient.put<ServiceResponse<Floor>>(
      `${API_ENDPOINTS.UPDATE_FLOOR}/${floorId}`,
      data
    );

    if (response && response.isSuccess && response.data) {
      return response.data;
    }

    throw new Error(response?.message || 'Failed to update floor');
  },

  /**
   * Xóa tầng
   * Endpoint: DELETE /api/floors/floor/{floorId}
   */
  async deleteFloor(floorId: number): Promise<void> {
    const response = await apiClient.delete<ServiceResponse<void>>(
      `${API_ENDPOINTS.DELETE_FLOOR}/${floorId}`
    );

    if (!response || !response.isSuccess) {
      throw new Error(response?.message || 'Failed to delete floor');
    }
  },
};

