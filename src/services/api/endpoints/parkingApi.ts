import { apiClient } from '../apiClient';
import { API_ENDPOINTS } from '../../../utils/constants';
import {
  Parking,
  CreateParkingRequest,
  UpdateParkingRequest,
  UpdateParkingLocationRequest,
  DisableParkingByDateRequest,
  DisableParkingByDateTimeRequest,
  EnableDisableParkingAtDateRequest,
  CancelDisableScheduledRequest,
  ScheduledDisableHistory,
  SuccessedDisableHistory,
  ServiceResponse,
} from '../../../types';

export const parkingApi = {
  /**
   * Lấy danh sách tất cả parking
   * Endpoint: GET /api/parkings?managerId={managerId}&pageNo={pageNo}&pageSize={pageSize}
   */
  async getAllParkings(
    managerId?: number,
    pageNo: number = 1,
    pageSize: number = 10
  ): Promise<Parking[]> {
    const params: any = { pageNo, pageSize };
    if (managerId) {
      params.managerId = managerId;
    }

    const response: any = await apiClient.get(
      API_ENDPOINTS.GET_ALL_PARKINGS,
      { params }
    );

    // Handle response format: { success, data, message } hoặc { isSuccess, data, message }
    const isSuccess = response?.success || response?.isSuccess;
    
    // Nếu success nhưng data là null → có thể chưa có business profile hoặc chưa có parking
    if (isSuccess) {
      // Check message để xác định lỗi cụ thể
      const message = response?.message || '';
      
      if (message.includes('Không tìm thấy tài khoản doanh nghiệp') || 
          message.includes('business profile') ||
          message.includes('doanh nghiệp')) {
        // Manager chưa có business profile → return empty array nhưng không throw error
        // Frontend sẽ hiển thị message nhẹ nhàng hơn
        console.warn('Business profile not found. Manager may need to create business profile first.');
        return [];
      }
      
      // Nếu có data
      if (response?.data) {
        // Data có thể ở response.data hoặc response.data.data
        const parkingData = response.data?.data || response.data;
        
        // Nếu là array, filter và return (loại bỏ items không có id)
        if (Array.isArray(parkingData)) {
          return parkingData.filter((item: any) => item?.id != null);
        } 
        // Nếu là object (có thể là paginated response hoặc single item)
        else if (parkingData && typeof parkingData === 'object') {
          // Paginated response có thể có items array
          const items = parkingData.items || (parkingData.id ? [parkingData] : []);
          return Array.isArray(items) ? items.filter((item: any) => item?.id != null) : [];
        }
      }
      
      // Nếu data là null hoặc undefined nhưng không có message lỗi cụ thể
      // → Có thể chỉ là chưa có parking nào → return empty array
      return [];
    }

    throw new Error(response?.message || 'Failed to get parkings');
  },

  /**
   * Lấy thông tin chi tiết parking
   * Endpoint: GET /api/parkings/parking/{parkingId}
   */
  async getParkingById(parkingId: number): Promise<Parking> {
    const response = await apiClient.get<ServiceResponse<Parking>>(
      `${API_ENDPOINTS.GET_PARKING_BY_ID}/${parkingId}`
    );

    if (response && response.isSuccess && response.data) {
      return response.data;
    }

    throw new Error(response?.message || 'Failed to get parking');
  },

  /**
   * Tạo parking mới
   * Endpoint: POST /api/parkings/parking
   * Request body dùng PascalCase: { Name, Address, Description, Latitude, Longitude, ManagerId, IsPrepayment, IsOvernight }
   */
  async createParking(data: CreateParkingRequest): Promise<Parking> {
    const response: any = await apiClient.post(
      API_ENDPOINTS.CREATE_PARKING,
      data
    );

    // Handle response format: { success, data, message } hoặc { isSuccess, data, message }
    const isSuccess = response?.success || response?.isSuccess;
    const message = response?.message || response?.data?.message || '';
    
    // Check for business profile error
    if (isSuccess && (message.includes('Không tìm thấy tài khoản doanh nghiệp') || message.includes('Business Profile'))) {
      throw new Error('Bạn cần tạo Business Profile trước khi tạo bãi đỗ. Vui lòng liên hệ admin để được hỗ trợ.');
    }
    
    // Check for subscription/package error
    if (message.includes('chưa áp dụng gói') || message.includes('chưa áp dụng package') || message.includes('subscription')) {
      throw new Error('Doanh nghiệp chưa áp dụng gói. Vui lòng liên hệ admin để đăng ký gói dịch vụ trước khi tạo bãi đỗ.');
    }
    
    // Check for duplicate name error
    if (isSuccess && message.includes('Tên bãi xe đã tồn tại')) {
      throw new Error('Tên bãi xe đã tồn tại. Vui lòng nhập tên bãi xe khác.');
    }
    
    if (isSuccess && response?.data !== undefined) {
      // Response.data có thể là ParkingId (number) hoặc Parking object
      const parkingData = response.data;
      
      // Nếu là số (ParkingId) - success response theo API spec
      // Response format: { "data": 123, "success": true } - data là ParkingId
      if (typeof parkingData === 'number' && parkingData > 0) {
        // Return Parking object với id = parkingData để compatible với Redux
        return {
          id: parkingData,
          name: data.name,
          address: data.address,
          description: data.description,
          motoSpot: data.motoSpot,
          carSpot: data.carSpot,
          isPrepayment: data.isPrepayment,
          isOvernight: data.isOvernight,
          managerId: data.managerId,
          isActive: false, // Mặc định chưa kích hoạt theo API spec
        } as Parking;
      }
      
      // Nếu là object với id
      if (parkingData && typeof parkingData === 'object' && parkingData.id) {
        return parkingData as Parking;
      }
      
      // Nếu data là 0 nhưng success, có thể là validation error
      if (parkingData === 0) {
        throw new Error(message || 'Không thể tạo bãi đỗ. Vui lòng kiểm tra lại thông tin.');
      }
    }

    // Nếu success = false
    if (!isSuccess) {
      throw new Error(message || 'Không thể tạo bãi đỗ. Vui lòng kiểm tra lại thông tin.');
    }

    throw new Error(message || 'Failed to create parking');
  },

  /**
   * Cập nhật thông tin parking
   * Endpoint: PUT /api/parkings/parking/{parkingId}
   * Request body dùng PascalCase: { Name, Address, Description, Latitude, Longitude, IsPrepayment, IsOvernight }
   */
  async updateParking(
    parkingId: number,
    data: UpdateParkingRequest
  ): Promise<Parking> {
    const response: any = await apiClient.put(
      `${API_ENDPOINTS.UPDATE_PARKING}/${parkingId}`,
      data
    );

    // Handle response format: { success, data, message } hoặc { isSuccess, data, message }
    const isSuccess = response?.success || response?.isSuccess;
    const message = response?.message || response?.data?.message || '';
    
    // Check for business profile error
    if (isSuccess && message.includes('Không tìm thấy tài khoản doanh nghiệp')) {
      throw new Error('Bạn cần tạo Business Profile trước khi cập nhật bãi đỗ. Vui lòng liên hệ admin để được hỗ trợ.');
    }
    
    if (isSuccess && response?.data) {
      // Data có thể ở response.data hoặc response.data.data
      const parkingData = response.data?.data || response.data;
      
      if (parkingData && typeof parkingData === 'object' && parkingData.id) {
        return parkingData;
      }
    }

    throw new Error(message || 'Failed to update parking');
  },

  /**
   * Cập nhật vị trí parking (latitude, longitude)
   * Endpoint: PUT /api/parkings/parking/location/{parkingId}
   */
  async updateParkingLocation(
    parkingId: number,
    data: UpdateParkingLocationRequest
  ): Promise<Parking> {
    const response = await apiClient.put<ServiceResponse<Parking>>(
      `${API_ENDPOINTS.UPDATE_PARKING_LOCATION}/${parkingId}`,
      data
    );

    if (response && response.isSuccess && response.data) {
      return response.data;
    }

    throw new Error(response?.message || 'Failed to update parking location');
  },

  /**
   * Xóa parking
   * Endpoint: DELETE /api/parkings/parking/{parkingId}
   */
  async deleteParking(parkingId: number): Promise<void> {
    const response = await apiClient.delete<ServiceResponse<void>>(
      `${API_ENDPOINTS.DELETE_PARKING}/${parkingId}`
    );

    if (!response || !response.isSuccess) {
      throw new Error(response?.message || 'Failed to delete parking');
    }
  },

  /**
   * Đánh dấu parking là full
   * Endpoint: PUT /api/parkings/parking/full/{parkingId}
   */
  async markParkingFull(parkingId: number): Promise<Parking> {
    const response = await apiClient.put<ServiceResponse<Parking>>(
      `${API_ENDPOINTS.MARK_PARKING_FULL}/${parkingId}`
    );

    if (response && response.isSuccess && response.data) {
      return response.data;
    }

    throw new Error(response?.message || 'Failed to mark parking as full');
  },

  /**
   * Vô hiệu hóa parking theo ngày
   * Endpoint: PUT /api/parkings/disable-parking-by-date
   */
  async disableParkingByDate(
    data: DisableParkingByDateRequest
  ): Promise<void> {
    const response = await apiClient.put<ServiceResponse<void>>(
      API_ENDPOINTS.DISABLE_PARKING_BY_DATE,
      data
    );

    if (!response || !response.isSuccess) {
      throw new Error(response?.message || 'Failed to disable parking');
    }
  },

  /**
   * Vô hiệu hóa parking theo ngày và giờ
   * Endpoint: PUT /api/parkings/disable-parking-by-date-time
   */
  async disableParkingByDateTime(
    data: DisableParkingByDateTimeRequest
  ): Promise<void> {
    const response = await apiClient.put<ServiceResponse<void>>(
      API_ENDPOINTS.DISABLE_PARKING_BY_DATETIME,
      data
    );

    if (!response || !response.isSuccess) {
      throw new Error(response?.message || 'Failed to disable parking');
    }
  },

  /**
   * Enable/Disable parking tại một ngày cụ thể
   * Endpoint: PUT /api/parkings/enable-disable-parking-at-date
   */
  async enableDisableParkingAtDate(
    data: EnableDisableParkingAtDateRequest
  ): Promise<void> {
    const response = await apiClient.put<ServiceResponse<void>>(
      API_ENDPOINTS.ENABLE_DISABLE_PARKING_AT_DATE,
      data
    );

    if (!response || !response.isSuccess) {
      throw new Error(response?.message || 'Failed to enable/disable parking');
    }
  },

  /**
   * Hủy lịch disable đã lên lịch
   * Endpoint: DELETE /api/parkings/cancel-disable-scheduled-parking
   */
  async cancelDisableScheduled(
    data: CancelDisableScheduledRequest
  ): Promise<void> {
    const response = await apiClient.delete<ServiceResponse<void>>(
      API_ENDPOINTS.CANCEL_DISABLE_SCHEDULED,
      { data }
    );

    if (!response || !response.isSuccess) {
      throw new Error(response?.message || 'Failed to cancel scheduled disable');
    }
  },

  /**
   * Lấy lịch sử vô hiệu hóa đã lên lịch
   * Endpoint: GET /api/parkings/scheduled-history-disable-parking?parkingId={parkingId}
   */
  async getScheduledDisableHistory(
    parkingId?: number
  ): Promise<ScheduledDisableHistory[]> {
    const params = parkingId ? { parkingId } : {};
    const response = await apiClient.get<ServiceResponse<ScheduledDisableHistory[]>>(
      API_ENDPOINTS.GET_SCHEDULED_DISABLE_HISTORY,
      { params }
    );

    if (response && response.isSuccess && response.data) {
      return response.data;
    }

    throw new Error(response?.message || 'Failed to get scheduled disable history');
  },

  /**
   * Lấy lịch sử vô hiệu hóa đã thực hiện
   * Endpoint: GET /api/parkings/successed-history-disable-parking?parkingId={parkingId}
   */
  async getSuccessedDisableHistory(
    parkingId?: number
  ): Promise<SuccessedDisableHistory[]> {
    const params = parkingId ? { parkingId } : {};
    const response = await apiClient.get<ServiceResponse<SuccessedDisableHistory[]>>(
      API_ENDPOINTS.GET_SUCCESSED_DISABLE_HISTORY,
      { params }
    );

    if (response && response.isSuccess && response.data) {
      return response.data;
    }

    throw new Error(response?.message || 'Failed to get successed disable history');
  },
};
