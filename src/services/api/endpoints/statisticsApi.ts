import { apiClient } from '../apiClient';
import { API_ENDPOINTS } from '../../../utils/constants';
import {
  StatisticCard,
  PieChartData,
  LineChartData,
  RevenueChartParams,
  ServiceResponse,
} from '../../../types';

export const statisticsApi = {
  /**
   * Lấy thống kê tổng quan (statistic card)
   * Endpoint: GET /api/chart/card/statistic-card?managerId={managerId}
   */
  async getStatisticCard(managerId: number): Promise<StatisticCard> {
    const response: any = await apiClient.get(API_ENDPOINTS.GET_STATISTIC_CARD, {
      params: { managerId },
    });

    const isSuccess = response?.success || response?.isSuccess;
    const message = response?.message || '';

    // Handle case: Manager chưa có business profile
    if (isSuccess && message.includes('Không tìm thấy thông tin doanh nghiệp')) {
      console.warn('Business profile not found for manager:', managerId);
      return {} as StatisticCard; // Return empty object instead of throwing
    }

    if (isSuccess && response?.data) {
      const cardData = response.data?.data || response.data;
      return cardData || ({} as StatisticCard);
    }

    throw new Error(message || 'Failed to get statistic card');
  },

  /**
   * Lấy thống kê Done/Cancel booking (pie chart)
   * Endpoint: GET /api/chart/pie/done-cancel-booking?managerId={managerId}
   */
  async getPieChartDoneCancel(managerId: number): Promise<PieChartData> {
    const response: any = await apiClient.get(
      API_ENDPOINTS.GET_PIE_DONE_CANCEL_BOOKING,
      {
        params: { managerId },
      }
    );

    const isSuccess = response?.success || response?.isSuccess;
    const message = response?.message || '';

    // Handle case: Manager chưa có business profile
    if (isSuccess && message.includes('Không tìm thấy thông tin doanh nghiệp')) {
      console.warn('Business profile not found for manager:', managerId);
      return {} as PieChartData; // Return empty object instead of throwing
    }

    if (isSuccess && response?.data) {
      const chartData = response.data?.data || response.data;
      return chartData || ({} as PieChartData);
    }

    throw new Error(message || 'Failed to get pie chart data');
  },

  /**
   * Lấy doanh thu theo tuần/tháng (line chart)
   * Endpoint: GET /api/chart/line/month-or-week-revenue?managerId={managerId}&week={week}&month={month}
   */
  async getRevenueChart(
    params: RevenueChartParams
  ): Promise<LineChartData> {
    const { managerId, week, month } = params;
    const queryParams: any = { managerId };
    
    if (week !== undefined) {
      queryParams.week = week;
    }
    if (month !== undefined) {
      queryParams.month = month;
    }

    const response: any = await apiClient.get(API_ENDPOINTS.GET_LINE_REVENUE, {
      params: queryParams,
    });

    const isSuccess = response?.success || response?.isSuccess;
    const message = response?.message || '';

    // Handle case: Manager chưa có business profile
    if (isSuccess && message.includes('Không tìm thấy thông tin doanh nghiệp')) {
      console.warn('Business profile not found for manager:', managerId);
      return {} as LineChartData; // Return empty object instead of throwing
    }

    if (isSuccess && response?.data) {
      const chartData = response.data?.data || response.data;
      return chartData || ({} as LineChartData);
    }

    throw new Error(message || 'Failed to get revenue chart data');
  },

  /**
   * Lấy thống kê tổng quan theo bãi đỗ
   * Endpoint: GET /api/chart/card/parkings/{parkingId}/statistic-card
   */
  async getParkingStatisticCard(parkingId: number): Promise<StatisticCard> {
    const response: any = await apiClient.get(
      `${API_ENDPOINTS.GET_PARKING_STATISTIC_CARD}/${parkingId}/statistic-card`
    );

    const isSuccess = response?.success || response?.isSuccess;

    if (isSuccess && response?.data) {
      const cardData = response.data?.data || response.data;
      return cardData;
    }

    throw new Error(response?.message || 'Failed to get parking statistic card');
  },

  /**
   * Lấy thống kê Done/Cancel theo bãi đỗ
   * Endpoint: GET /api/chart/pie/parkings/{parkingId}/done-cancel-booking
   */
  async getParkingPieChart(parkingId: number): Promise<PieChartData> {
    const response: any = await apiClient.get(
      `${API_ENDPOINTS.GET_PIE_PARKING_DONE_CANCEL}/${parkingId}/done-cancel-booking`
    );

    const isSuccess = response?.success || response?.isSuccess;

    if (isSuccess && response?.data) {
      const chartData = response.data?.data || response.data;
      return chartData;
    }

    throw new Error(
      response?.message || 'Failed to get parking pie chart data'
    );
  },

  /**
   * Lấy doanh thu theo bãi đỗ
   * Endpoint: GET /api/chart/line/parkings/{parkingId}/month-or-week-revenue?week={week}&month={month}
   */
  async getParkingRevenueChart(
    parkingId: number,
    week?: number,
    month?: number
  ): Promise<LineChartData> {
    const queryParams: any = {};
    if (week !== undefined) {
      queryParams.week = week;
    }
    if (month !== undefined) {
      queryParams.month = month;
    }

    const response: any = await apiClient.get(
      `${API_ENDPOINTS.GET_LINE_PARKING_REVENUE}/${parkingId}/month-or-week-revenue`,
      { params: queryParams }
    );

    const isSuccess = response?.success || response?.isSuccess;

    if (isSuccess && response?.data) {
      const chartData = response.data?.data || response.data;
      return chartData;
    }

    throw new Error(
      response?.message || 'Failed to get parking revenue chart data'
    );
  },
};

