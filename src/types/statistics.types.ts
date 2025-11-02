// Statistics & Charts Types

export interface StatisticCard {
  totalParkings?: number;
  activeParkings?: number;
  totalBookings?: number;
  todayBookings?: number;
  totalRevenue?: number;
  todayRevenue?: number;
  weekRevenue?: number;
  monthRevenue?: number;
  activeKeepers?: number;
  [key: string]: any;
}

export interface PieChartData {
  done?: number;
  cancel?: number;
  pending?: number;
  total?: number;
  [key: string]: any;
}

export interface LineChartData {
  labels?: string[]; // Dates or weeks/months
  revenues?: number[];
  [key: string]: any;
}

export interface RevenueChartParams {
  managerId: number;
  week?: number; // Week number (1-52)
  month?: number; // Month number (1-12)
}

export interface StatisticsState {
  statisticCard: StatisticCard | null;
  pieChartData: PieChartData | null;
  revenueChartData: LineChartData | null;
  isLoading: boolean;
  error: string | null;
}

