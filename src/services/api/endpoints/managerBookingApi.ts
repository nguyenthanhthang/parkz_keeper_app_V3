import { apiClient } from '../apiClient';
import { API_ENDPOINTS } from '../../../utils/constants';
import {
  Booking,
  ApproveBookingRequest,
  CheckoutBookingRequest,
  MarkBookingDoneRequest,
  ManagerBookingFilter,
  ServiceResponse,
} from '../../../types';

export const managerBookingApi = {
  /**
   * Lấy danh sách booking theo Manager ID
   * Endpoint: GET /api/booking-management/request/{managerId}?pageNo={pageNo}&pageSize={pageSize}
   */
  async getBookingsByManager(
    managerId: number,
    pageNo: number = 1,
    pageSize: number = 10
  ): Promise<Booking[]> {
    const response: any = await apiClient.get(
      `${API_ENDPOINTS.GET_MANAGER_BOOKINGS}/${managerId}`,
      {
        params: { pageNo, pageSize },
      }
    );

    const isSuccess = response?.success || response?.isSuccess;
    if (isSuccess && response?.data) {
      // Unwrap nested data structure
      const data = response.data?.data ?? response.data;
      return Array.isArray(data) ? data : [];
    }

    throw new Error(response?.message || 'Failed to get bookings');
  },

  /**
   * Lấy danh sách booking theo Parking ID
   * Endpoint: GET /api/booking-management/parkings/{parkingId}?pageNo={pageNo}&pageSize={pageSize}
   */
  async getBookingsByParking(
    parkingId: number,
    pageNo: number = 1,
    pageSize: number = 10
  ): Promise<Booking[]> {
    const response: any = await apiClient.get(
      `${API_ENDPOINTS.GET_BOOKINGS_BY_PARKING}/${parkingId}`,
      {
        params: { pageNo, pageSize },
      }
    );

    const isSuccess = response?.success || response?.isSuccess;
    if (isSuccess && response?.data) {
      // Unwrap nested data structure
      const data = response.data?.data ?? response.data;
      return Array.isArray(data) ? data : [];
    }

    throw new Error(response?.message || 'Failed to get bookings by parking');
  },

  /**
   * Lấy chi tiết booking
   * Endpoint: GET /api/booking-management/{bookingId}
   */
  async getBookingDetail(bookingId: number): Promise<Booking> {
    const response: any = await apiClient.get(
      `${API_ENDPOINTS.GET_MANAGER_BOOKING_DETAIL}/${bookingId}`
    );

    const isSuccess = response?.success || response?.isSuccess;
    if (isSuccess && response?.data) {
      // Unwrap nested data structure
      const data = response.data?.data ?? response.data;
      return data;
    }

    throw new Error(response?.message || 'Failed to get booking detail');
  },

  /**
   * Duyệt booking
   * Endpoint: POST /api/booking-management/approve-booking
   * SignalR: LoadHistoryInManager
   */
  async approveBooking(data: ApproveBookingRequest): Promise<Booking> {
    const response: any = await apiClient.post(
      API_ENDPOINTS.APPROVE_BOOKING,
      data
    );

    const isSuccess = response?.success || response?.isSuccess;
    if (isSuccess && response?.data) {
      // Unwrap nested data structure
      const data = response.data?.data ?? response.data;
      return data;
    }

    throw new Error(response?.message || 'Failed to approve booking');
  },

  /**
   * Check-out booking
   * Endpoint: PUT /api/booking-management/check-out
   * SignalR: LoadHistoryInManager
   */
  async checkoutBooking(data: CheckoutBookingRequest): Promise<Booking> {
    const response: any = await apiClient.put(
      API_ENDPOINTS.CHECKOUT_BOOKING,
      data
    );

    const isSuccess = response?.success || response?.isSuccess;
    if (isSuccess && response?.data) {
      // Unwrap nested data structure
      const data = response.data?.data ?? response.data;
      return data;
    }

    throw new Error(response?.message || 'Failed to checkout booking');
  },

  /**
   * Đánh dấu booking hoàn thành
   * Endpoint: PUT /api/booking-management/done
   */
  async markBookingDone(data: MarkBookingDoneRequest): Promise<Booking> {
    const response: any = await apiClient.put(
      API_ENDPOINTS.MARK_BOOKING_DONE,
      data
    );

    const isSuccess = response?.success || response?.isSuccess;
    if (isSuccess && response?.data) {
      // Unwrap nested data structure
      const data = response.data?.data ?? response.data;
      return data;
    }

    throw new Error(response?.message || 'Failed to mark booking done');
  },
};

