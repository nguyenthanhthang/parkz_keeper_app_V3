import { apiClient } from '../apiClient';
import { API_ENDPOINTS } from '../../../utils/constants';
import { ServiceResponse } from '../../../types';

export interface Keeper {
  id: number;
  userId: number;
  name: string;
  email: string;
  phone?: string;
  managerId: number;
  managerName?: string;
  isActive: boolean;
  createdAt?: string;
}

export interface CreateKeeperRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
  managerId: number;
}

export const keeperApi = {
  /**
   * Lấy danh sách keeper theo Manager
   * Endpoint: GET /api/keeper-account-management?pageNo={pageNo}&pageSize={pageSize}&managerId={managerId}
   */
  async getKeeperAccounts(
    managerId: number,
    pageNo: number = 1,
    pageSize: number = 10
  ): Promise<Keeper[]> {
    const response: any = await apiClient.get(
      API_ENDPOINTS.GET_KEEPER_ACCOUNTS,
      {
        params: { managerId, pageNo, pageSize },
      }
    );

    const isSuccess = response?.success || response?.isSuccess;
    if (isSuccess && response?.data) {
      // Unwrap nested data structure
      const data = response.data?.data ?? response.data;
      return Array.isArray(data) ? data : [];
    }

    throw new Error(response?.message || 'Failed to get keeper accounts');
  },

  /**
   * Tạo tài khoản keeper mới
   * Endpoint: POST /api/keeper-account-management/register
   * SignalR: LoadKeeperAccounts
   */
  async createKeeper(data: CreateKeeperRequest): Promise<Keeper> {
    const response: any = await apiClient.post(
      API_ENDPOINTS.CREATE_KEEPER,
      data
    );

    const isSuccess = response?.success || response?.isSuccess;
    if (isSuccess && response?.data) {
      // Unwrap nested data structure
      const data = response.data?.data ?? response.data;
      return data;
    }

    throw new Error(response?.message || 'Failed to create keeper');
  },

  /**
   * Lấy chi tiết keeper
   * Endpoint: GET /api/keeper-account-management/{userId}
   */
  async getKeeperDetail(userId: number): Promise<Keeper> {
    const response: any = await apiClient.get(
      `${API_ENDPOINTS.GET_KEEPER_ACCOUNTS}/${userId}`
    );

    const isSuccess = response?.success || response?.isSuccess;
    if (isSuccess && response?.data) {
      // Unwrap nested data structure
      const data = response.data?.data ?? response.data;
      return data;
    }

    throw new Error(response?.message || 'Failed to get keeper detail');
  },

  /**
   * Vô hiệu hóa/Kích hoạt keeper
   * Endpoint: DELETE /api/keeper-account-management/{keeperId}
   * SignalR: LoadKeeperAccounts
   */
  async deleteKeeper(keeperId: number): Promise<void> {
    const response = await apiClient.delete<ServiceResponse<void>>(
      `${API_ENDPOINTS.DELETE_KEEPER}/${keeperId}`
    );

    if (!response || !response.isSuccess) {
      throw new Error(response?.message || 'Failed to delete keeper');
    }
  },

  /**
   * Lấy danh sách keeper (alternative endpoint)
   * Endpoint: GET /api/keeper-management/manager?pageNo={pageNo}&pageSize={pageSize}&managerId={managerId}
   */
  async getKeeperManagement(
    managerId: number,
    pageNo: number = 1,
    pageSize: number = 10
  ): Promise<Keeper[]> {
    const response: any = await apiClient.get(
      API_ENDPOINTS.GET_KEEPER_MANAGEMENT,
      {
        params: { managerId, pageNo, pageSize },
      }
    );

    const isSuccess = response?.success || response?.isSuccess;
    if (isSuccess && response?.data) {
      // Unwrap nested data structure
      const data = response.data?.data ?? response.data;
      return Array.isArray(data) ? data : [];
    }

    throw new Error(response?.message || 'Failed to get keeper management');
  },
};

