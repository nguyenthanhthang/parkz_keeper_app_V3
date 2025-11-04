import { apiClient } from '../apiClient';
import { API_ENDPOINTS, DEFAULT_PAGE_SIZE, DEFAULT_PAGE_NO } from '../../../utils/constants';
import { tokenStorage } from '../../../utils/storage';
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
  // Extended fields from keeper detail API
  checkinTime?: string | null;
  checkoutTime?: string | null;
  totalPrice?: number | null;
  unPaidMoney?: number | null;
  paymentMethod?: string | null;
}

export const bookingApi = {
  /**
   * Tạo booking cho passerby (khách vãng lai)
   */
  async createPasserbyBooking(data: CreateBookingForPasserbyRequest): Promise<number> {
    const response = await apiClient.post<any>(
      API_ENDPOINTS.CREATE_PASSERBY_BOOKING,
      data
    );
    const isSuccess = (response as any)?.isSuccess || (response as any)?.success;
    const respData = (response as any)?.data?.data ?? (response as any)?.data;
    if (isSuccess && respData != null) {
      return respData as number;
    }
    throw new Error((response as any)?.message || 'Failed to create booking');
  },

  /**
   * Tìm kiếm booking theo search string
   */
  async searchBooking(
    keeperId: number,
    searchString: string
  ): Promise<SearchBookingResponse[]> {
    const response = await apiClient.get<any>(
      `${API_ENDPOINTS.SEARCH_BOOKING}/${keeperId}`,
      {
        params: { searchString },
      }
    );
    const isSuccess = (response as any)?.isSuccess || (response as any)?.success;
    const data = (response as any)?.data?.data ?? (response as any)?.data;
    if (isSuccess && data) {
      const arr = Array.isArray(data) ? data : (data?.items ?? []);
      // Search API có thể trả về cùng nested structure hoặc flat structure
      return (arr as any[]).map((item: any) => {
        const booking = item?.bookingSearchResult || {};
        const vehicle = item?.vehicleInforSearchResult || {};
        const slot = item?.parkingSlotSearchResult || {};
        
        const bookingId = booking?.bookingId ?? item?.bookingId ?? item?.id ?? item?.bookingCode;
        return {
          id: bookingId,
          bookingId: bookingId,
          customerName: item?.customerName ?? item?.userName ?? item?.guestName ?? '',
          customerPhone: item?.customerPhone ?? item?.phone ?? item?.guestPhone ?? '',
          licensePlate: vehicle?.licensePlate ?? item?.licensePlate ?? '',
          slotName: slot?.name ?? item?.slotName ?? '',
          status: booking?.status ?? item?.status ?? '',
        };
      }) as SearchBookingResponse[];
    }
    throw new Error((response as any)?.message || 'Failed to search booking');
  },

  /**
   * Lấy danh sách tất cả booking của keeper
   */
  async getAllBookings(
    keeperId: number,
    pageNo: number = DEFAULT_PAGE_NO,
    pageSize: number = DEFAULT_PAGE_SIZE
  ): Promise<GetAllBookingByKeeperIdResponse[]> {
    // DEV ONLY: Return mock data when using mock token
    const token = await tokenStorage.getToken();
    if (__DEV__ && token === 'mock_token_dev_only') {
      console.log('📦 [MOCK] Bypassing API call, returning empty bookings array for testing');
      return [];
    }

    const response = await apiClient.get<any>(
      `${API_ENDPOINTS.GET_ALL_BOOKINGS}/${keeperId}/parkings`,
      {
        params: { pageNo, pageSize },
      }
    );
    const isSuccess = (response as any)?.isSuccess || (response as any)?.success;
    const data = (response as any)?.data?.data ?? (response as any)?.data;
    if (isSuccess && data) {
      const arr = Array.isArray(data) ? data : (data?.items ?? []);
      if (__DEV__) {
        try {
          // eslint-disable-next-line no-console
          console.log('[bookingApi.getAllBookings] raw response:', JSON.stringify(arr[0] || {}, null, 2));
        } catch {}
      }
      // API trả về nested structure với 4 nhóm: bookingSearchResult, vehicleInforSearchResult, parkingSearchResult, parkingSlotSearchResult
      return (arr as any[]).map((item: any) => {
        const booking = item?.bookingSearchResult || {};
        const vehicle = item?.vehicleInforSearchResult || {};
        const parking = item?.parkingSearchResult || {};
        const slot = item?.parkingSlotSearchResult || {};
        
        return {
          id: booking?.bookingId ?? item?.id ?? item?.bookingId ?? item?.bookingCode,
          parkingSlotId: slot?.parkingSlotId ?? item?.parkingSlotId ?? 0,
          slotName: slot?.name ?? item?.slotName ?? '',
          customerName: item?.customerName ?? item?.userName ?? item?.guestName ?? '',
          customerPhone: item?.customerPhone ?? item?.phone ?? item?.guestPhone ?? '',
          licensePlate: vehicle?.licensePlate ?? item?.licensePlate ?? '',
          vehicleName: vehicle?.vehicleName ?? item?.vehicleName ?? '',
          vehicleColor: vehicle?.color ?? item?.vehicleColor ?? '',
          startTime: booking?.startTime ?? item?.startTime ?? '',
          endTime: booking?.endTime ?? item?.endTime ?? '',
          dateBook: booking?.dateBook ?? item?.dateBook ?? '',
          status: (booking?.status ?? item?.status) as any ?? 'Pending',
          createdAt: booking?.dateBook ?? item?.createdAt,
        };
      }) as GetAllBookingByKeeperIdResponse[];
    }
    throw new Error((response as any)?.message || 'Failed to get bookings');
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

    const response = await apiClient.get<any>(
      `${API_ENDPOINTS.FILTER_BOOKINGS}/${keeperId}/parkings`,
      { params }
    );
    const isSuccess = (response as any)?.isSuccess || (response as any)?.success;
    const data = (response as any)?.data?.data ?? (response as any)?.data;
    if (isSuccess && data) {
      const arr = Array.isArray(data) ? data : (data?.items ?? []);
      // Filter API cũng trả về cùng nested structure
      return (arr as any[]).map((item: any) => {
        const booking = item?.bookingSearchResult || {};
        const vehicle = item?.vehicleInforSearchResult || {};
        const parking = item?.parkingSearchResult || {};
        const slot = item?.parkingSlotSearchResult || {};
        
        return {
          id: booking?.bookingId ?? item?.id ?? item?.bookingId ?? item?.bookingCode,
          parkingSlotId: slot?.parkingSlotId ?? item?.parkingSlotId ?? 0,
          slotName: slot?.name ?? item?.slotName ?? '',
          customerName: item?.customerName ?? item?.userName ?? item?.guestName ?? '',
          customerPhone: item?.customerPhone ?? item?.phone ?? item?.guestPhone ?? '',
          licensePlate: vehicle?.licensePlate ?? item?.licensePlate ?? '',
          vehicleName: vehicle?.vehicleName ?? item?.vehicleName ?? '',
          vehicleColor: vehicle?.color ?? item?.vehicleColor ?? '',
          startTime: booking?.startTime ?? item?.startTime ?? '',
          endTime: booking?.endTime ?? item?.endTime ?? '',
          dateBook: booking?.dateBook ?? item?.dateBook ?? '',
          status: (booking?.status ?? item?.status) as any ?? 'Pending',
          createdAt: booking?.dateBook ?? item?.createdAt,
        };
      }) as GetAllBookingByKeeperIdResponse[];
    }
    throw new Error((response as any)?.message || 'Failed to filter bookings');
  },

  /**
   * Lấy thông tin chi tiết booking
   * API: GET /api/keeper/booking-Infomation?bookingId={bookingId}
   * Response có thể có nested structure hoặc flat structure
   */
  async getBookingInfo(bookingId: number): Promise<BookingInformationResponse> {
    const response = await apiClient.get<any>(
      API_ENDPOINTS.GET_BOOKING_INFO,
      {
        params: { bookingId },
      }
    );
    const isSuccess = (response as any)?.isSuccess || (response as any)?.success;
    const data = (response as any)?.data?.data ?? (response as any)?.data;
    if (isSuccess && data) {
      if (__DEV__) {
        try {
          // eslint-disable-next-line no-console
          console.log('[bookingApi.getBookingInfo] raw response:', JSON.stringify(data, null, 2));
        } catch {}
      }
      
      // Check if data has nested structure (like list API) or flat structure
      const booking = data?.bookingSearchResult || data?.bookingDetails || data?.booking || data;
      const vehicle = data?.vehicleInforSearchResult || booking?.vehicleInfor || data?.vehicleInfor || data?.vehicle || data;
      const slot = data?.parkingSlotSearchResult || data?.parkingSlot || data?.slot || data;
      const user = data?.user || data?.customer || {
        name: booking?.guestName,
        phone: booking?.guestPhone,
      };
      
      return {
        id: booking?.bookingId ?? data?.id ?? data?.bookingId ?? bookingId,
        parkingSlotId: slot?.parkingSlotId ?? data?.parkingSlotId ?? slot?.id ?? data?.slotId ?? 0,
        slotName: slot?.name ?? data?.slotName ?? data?.parkingSlotName ?? '',
        customerName: user?.name ?? data?.customerName ?? data?.userName ?? '',
        customerPhone: user?.phone ?? data?.customerPhone ?? data?.phone ?? '',
        licensePlate: vehicle?.licensePlate ?? data?.licensePlate ?? '',
        vehicleName: vehicle?.vehicleName ?? data?.vehicleName ?? vehicle?.brand ?? '',
        vehicleColor: vehicle?.color ?? data?.vehicleColor ?? '',
        startTime: booking?.startTime ?? data?.startTime ?? '',
        endTime: booking?.endTime ?? data?.endTime ?? '',
        dateBook: booking?.dateBook ?? data?.dateBook ?? booking?.createdAt ?? '',
        status: (booking?.status ?? data?.status) as any ?? 'Pending',
        createdAt: booking?.dateBook ?? data?.createdAt ?? booking?.createdAt ?? '',
        updatedAt: booking?.updatedAt ?? data?.updatedAt ?? '',
        checkinTime: booking?.checkinTime ?? data?.checkinTime ?? null,
        checkoutTime: booking?.checkoutTime ?? data?.checkoutTime ?? null,
        totalPrice: booking?.totalPrice ?? data?.totalPrice ?? null,
        unPaidMoney: booking?.unPaidMoney ?? data?.unPaidMoney ?? null,
        paymentMethod: (booking?.transactions?.[0]?.paymentMethod ?? data?.transactions?.[0]?.paymentMethod) ?? null,
      } as BookingInformationResponse;
    }
    throw new Error((response as any)?.message || 'Failed to get booking info');
  },
};

