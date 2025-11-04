import { apiClient } from '../apiClient';
import { API_ENDPOINTS } from '../../../utils/constants';
import {
  ParkingPrice,
  CreateParkingPriceRequest,
  UpdateParkingPriceRequest,
  DisableEnableParkingPriceRequest,
  Timeline,
  CreateTimelineRequest,
  UpdateTimelineRequest,
  ParkingHasPrice,
  CreateParkingHasPriceRequest,
  UpdateParkingHasPriceRequest,
  ServiceResponse,
} from '../../../types';

export const pricingApi = {
  /**
   * Lấy danh sách bảng giá
   * Endpoint: GET /api/parking-price
   */
  async getParkingPrices(): Promise<ParkingPrice[]> {
    const response: any = await apiClient.get(API_ENDPOINTS.GET_PARKING_PRICES);

    const isSuccess = response?.success || response?.isSuccess;
    if (isSuccess && response?.data) {
      // Unwrap nested data structure
      const data = response.data?.data ?? response.data;
      return Array.isArray(data) ? data : [];
    }

    throw new Error(response?.message || 'Failed to get parking prices');
  },

  /**
   * Tạo bảng giá mới
   * Endpoint: POST /api/parking-price/create
   */
  async createParkingPrice(data: CreateParkingPriceRequest): Promise<ParkingPrice> {
    const response = await apiClient.post<ServiceResponse<ParkingPrice>>(
      API_ENDPOINTS.CREATE_PARKING_PRICE,
      data
    );

    const isSuccess = response?.success || response?.isSuccess;
    if (isSuccess && response?.data) {
      // Unwrap nested data structure
      const data = response.data?.data ?? response.data;
      return data;
    }

    throw new Error(response?.message || 'Failed to create parking price');
  },

  /**
   * Vô hiệu hóa/Kích hoạt bảng giá
   * Endpoint: PUT /api/parking-price/disable-or-enable-parking-price
   */
  async disableEnableParkingPrice(
    data: DisableEnableParkingPriceRequest
  ): Promise<ParkingPrice> {
    const response = await apiClient.put<ServiceResponse<ParkingPrice>>(
      API_ENDPOINTS.DISABLE_ENABLE_PARKING_PRICE,
      data
    );

    const isSuccess = response?.success || response?.isSuccess;
    if (isSuccess && response?.data) {
      // Unwrap nested data structure
      const data = response.data?.data ?? response.data;
      return data;
    }

    throw new Error(response?.message || 'Failed to disable/enable parking price');
  },

  /**
   * Lấy danh sách timeline theo parkingPriceId
   * Endpoint: GET /api/timeline-management/{parkingPriceId}
   */
  async getTimelinesByPrice(parkingPriceId: number): Promise<Timeline[]> {
    const response = await apiClient.get<ServiceResponse<Timeline[]>>(
      `${API_ENDPOINTS.GET_TIMELINES}/${parkingPriceId}`
    );

    const isSuccess = response?.success || response?.isSuccess;
    if (isSuccess && response?.data) {
      // Unwrap nested data structure
      const data = response.data?.data ?? response.data;
      return Array.isArray(data) ? data : [];
    }

    throw new Error(response?.message || 'Failed to get timelines');
  },

  /**
   * Tạo timeline mới
   * Endpoint: POST /api/timeline-management
   */
  async createTimeline(data: CreateTimelineRequest): Promise<Timeline> {
    const response: any = await apiClient.post(API_ENDPOINTS.CREATE_TIMELINE, data);

    const isSuccess = response?.success || response?.isSuccess;
    if (isSuccess && response?.data) {
      // Unwrap nested data structure
      const unwrappedData = response.data?.data ?? response.data;
      return unwrappedData;
    }

    throw new Error(response?.message || 'Failed to create timeline');
  },

  /**
   * Cập nhật timeline
   * Endpoint: PUT /api/timeline-management/{timelineId}
   */
  async updateTimeline(timelineId: number, data: UpdateTimelineRequest): Promise<Timeline> {
    const response: any = await apiClient.put(
      `${API_ENDPOINTS.UPDATE_TIMELINE}/${timelineId}`,
      data
    );

    const isSuccess = response?.success || response?.isSuccess;
    if (isSuccess && response?.data) {
      // Unwrap nested data structure
      const unwrappedData = response.data?.data ?? response.data;
      return unwrappedData;
    }

    throw new Error(response?.message || 'Failed to update timeline');
  },

  /**
   * Xóa timeline (vô hiệu hóa/Kích hoạt)
   * Endpoint: DELETE /api/timeline-management/{timelineId}
   */
  async deleteTimeline(timelineId: number): Promise<void> {
    const response = await apiClient.delete<ServiceResponse<void>>(
      `${API_ENDPOINTS.DELETE_TIMELINE}/${timelineId}`
    );

    if (!response || !response.isSuccess) {
      throw new Error(response?.message || 'Failed to delete timeline');
    }
  },

  /**
   * Lấy danh sách bãi đỗ có giá
   * Endpoint: GET /api/parkingHasPrice/getlistparkinghasprice
   */
  async getParkingHasPriceList(managerId?: number): Promise<ParkingHasPrice[]> {
    const params = managerId ? { managerId } : {};
    const response = await apiClient.get<ServiceResponse<ParkingHasPrice[]>>(
      API_ENDPOINTS.GET_PARKING_HAS_PRICE_LIST,
      { params }
    );

    const isSuccess = response?.success || response?.isSuccess;
    if (isSuccess && response?.data) {
      // Unwrap nested data structure
      const data = response.data?.data ?? response.data;
      return Array.isArray(data) ? data : [];
    }

    throw new Error(response?.message || 'Failed to get parking has price list');
  },

  /**
   * Lấy chi tiết bãi đỗ có giá
   * Endpoint: GET /api/parkingHasPrice/detail/{id}
   */
  async getParkingHasPriceDetail(id: number): Promise<ParkingHasPrice> {
    const response = await apiClient.get<ServiceResponse<ParkingHasPrice>>(
      `${API_ENDPOINTS.GET_PARKING_HAS_PRICE_DETAIL}/${id}`
    );

    const isSuccess = response?.success || response?.isSuccess;
    if (isSuccess && response?.data) {
      // Unwrap nested data structure
      const data = response.data?.data ?? response.data;
      return data;
    }

    throw new Error(response?.message || 'Failed to get parking has price detail');
  },

  /**
   * Gán giá cho bãi đỗ
   * Endpoint: POST /api/parkingHasPrice
   */
  async createParkingHasPrice(data: CreateParkingHasPriceRequest): Promise<ParkingHasPrice> {
    const response = await apiClient.post<ServiceResponse<ParkingHasPrice>>(
      API_ENDPOINTS.CREATE_PARKING_HAS_PRICE,
      data
    );

    const isSuccess = response?.success || response?.isSuccess;
    if (isSuccess && response?.data) {
      // Unwrap nested data structure
      const data = response.data?.data ?? response.data;
      return data;
    }

    throw new Error(response?.message || 'Failed to assign price to parking');
  },

  /**
   * Cập nhật gán giá
   * Endpoint: PUT /api/parkingHasPrice
   */
  async updateParkingHasPrice(
    id: number,
    data: UpdateParkingHasPriceRequest
  ): Promise<ParkingHasPrice> {
    const response = await apiClient.put<ServiceResponse<ParkingHasPrice>>(
      API_ENDPOINTS.UPDATE_PARKING_HAS_PRICE,
      { ...data, id }
    );

    const isSuccess = response?.success || response?.isSuccess;
    if (isSuccess && response?.data) {
      // Unwrap nested data structure
      const data = response.data?.data ?? response.data;
      return data;
    }

    throw new Error(response?.message || 'Failed to update parking has price');
  },

  /**
   * Xóa gán giá (v2)
   * Endpoint: DELETE /api/parkingHasPrice/v2/{parkingId}/{parkingPriceId}
   */
  async deleteParkingHasPrice(parkingId: number, parkingPriceId: number): Promise<void> {
    const response = await apiClient.delete<ServiceResponse<void>>(
      `${API_ENDPOINTS.DELETE_PARKING_HAS_PRICE_V2}/${parkingId}/${parkingPriceId}`
    );

    if (!response || !response.isSuccess) {
      throw new Error(response?.message || 'Failed to delete parking has price');
    }
  },
};

