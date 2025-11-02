import { apiClient } from '../apiClient';
import { API_ENDPOINTS, DEFAULT_PAGE_SIZE, DEFAULT_PAGE_NO } from '../../../utils/constants';
import { 
  Booking, 
  CreateBookingForPasserbyRequest,
  BookingFilter,
  BookingStatus,
  ServiceResponse,
  PaginatedResponse
} from '../../../types';

export interface SearchBookingResponse {
  id: number;
  bookingId?: number;
  customerName?: string;
  customerPhone?: string;
  licensePlate?: string;
  slotName?: string;
  status?: string;
}

export interface GetAllBookingByKeeperIdResponse {
  id: number;
  parkingSlotId: number;
  slotName?: string;
  customerName?: string;
  customerPhone?: string;
  licensePlate?: string;
  vehicleName?: string;
  vehicleColor?: string;
  startTime: string;
  endTime: string;
  dateBook: string;
  status: BookingStatus;
  createdAt?: string;
}

export interface BookingInformationResponse {
  id: number;
  parkingSlotId: number;
  slotName?: string;
  customerName?: string;
  customerPhone?: string;
  licensePlate?: string;
  vehicleName?: string;
  vehicleColor?: string;
  startTime: string;
  endTime: string;
  dateBook: string;
  status: BookingStatus;
  createdAt?: string;
  updatedAt?: string;
}

export const bookingApi = {
  /**
   * Tạo booking cho passerby (khách vãng lai)
   */
  async createPasserbyBooking(data: CreateBookingForPasserbyRequest): Promise<number> {
    const response = await apiClient.post<ServiceResponse<number>>(
      API_ENDPOINTS.CREATE_PASSERBY_BOOKING,
      data
    );
    
    if (response && response.isSuccess && response.data) {
      return response.data;
    }
    
    throw new Error(response?.message || 'Failed to create booking');
  },

  /**
   * Tìm kiếm booking theo search string
   */
  async searchBooking(
    keeperId: number,
    searchString: string
  ): Promise<SearchBookingResponse[]> {
    const response = await apiClient.get<ServiceResponse<SearchBookingResponse[]>>(
      `${API_ENDPOINTS.SEARCH_BOOKING}/${keeperId}`,
      {
        params: { searchString },
      }
    );
    
    if (response && response.isSuccess && response.data) {
      return response.data;
    }
    
    throw new Error(response?.message || 'Failed to search booking');
  },

  /**
   * Lấy danh sách tất cả booking của keeper
   */
  async getAllBookings(
    keeperId: number,
    pageNo: number = DEFAULT_PAGE_NO,
    pageSize: number = DEFAULT_PAGE_SIZE
  ): Promise<GetAllBookingByKeeperIdResponse[]> {
    const response = await apiClient.get<ServiceResponse<GetAllBookingByKeeperIdResponse[]>>(
      `${API_ENDPOINTS.GET_ALL_BOOKINGS}/${keeperId}/parkings`,
      {
        params: { pageNo, pageSize },
      }
    );
    
    if (response && response.isSuccess && response.data) {
      return response.data;
    }
    
    throw new Error(response?.message || 'Failed to get bookings');
  },

  /**
   * Lọc booking theo date và status
   */
  async filterBookings(
    keeperId: number,
    filters: BookingFilter,
    pageNo: number = DEFAULT_PAGE_NO,
    pageSize: number = DEFAULT_PAGE_SIZE
  ): Promise<GetAllBookingByKeeperIdResponse[]> {
    const params: any = { pageNo, pageSize };
    
    if (filters.date) {
      params.date = filters.date;
    }
    
    if (filters.status) {
      params.status = filters.status;
    }

    const response = await apiClient.get<ServiceResponse<GetAllBookingByKeeperIdResponse[]>>(
      `${API_ENDPOINTS.FILTER_BOOKINGS}/${keeperId}/parkings`,
      { params }
    );
    
    if (response && response.isSuccess && response.data) {
      return response.data;
    }
    
    throw new Error(response?.message || 'Failed to filter bookings');
  },

  /**
   * Lấy thông tin chi tiết booking
   */
  async getBookingInfo(bookingId: number): Promise<BookingInformationResponse> {
    const response = await apiClient.get<ServiceResponse<BookingInformationResponse>>(
      API_ENDPOINTS.GET_BOOKING_INFO,
      {
        params: { bookingId },
      }
    );
    
    if (response && response.isSuccess && response.data) {
      return response.data;
    }
    
    throw new Error(response?.message || 'Failed to get booking info');
  },
};

