import { apiClient } from '../apiClient';
import { API_ENDPOINTS, DEFAULT_PAGE_SIZE, DEFAULT_PAGE_NO } from '../../../utils/constants';
import { PaginatedResponse } from '../../../types';

// Types
export interface ConflictRequest {
  id: number;
  bookingId: number;
  bookingCode?: string;
  customerName?: string;
  customerPhone?: string;
  licensePlate?: string;
  slotName?: string;
  reason?: string;
  status: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface GetConflictRequestsParams {
  keeperId: number;
  pageNo?: number;
  pageSize?: number;
}

// API Functions
export const conflictRequestApi = {
  /**
   * Lấy danh sách conflict request của Keeper
   */
  getConflictRequests: async (
    params: GetConflictRequestsParams
  ): Promise<PaginatedResponse<ConflictRequest>> => {
    const { keeperId, pageNo = DEFAULT_PAGE_NO, pageSize = DEFAULT_PAGE_SIZE } = params;
    const response = await apiClient.get<PaginatedResponse<ConflictRequest>>(
      `${API_ENDPOINTS.GET_CONFLICT_REQUESTS}/${keeperId}`,
      {
        params: {
          pageNo,
          pageSize,
        },
      }
    );
    return response.data;
  },
};
