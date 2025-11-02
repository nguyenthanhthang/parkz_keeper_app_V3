import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { statisticsApi } from '../../services/api/endpoints/statisticsApi';
import {
  StatisticCard,
  PieChartData,
  LineChartData,
  RevenueChartParams,
} from '../../types';

interface StatisticsState {
  statisticCard: StatisticCard | null;
  pieChartData: PieChartData | null;
  revenueChartData: LineChartData | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: StatisticsState = {
  statisticCard: null,
  pieChartData: null,
  revenueChartData: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const getStatisticCard = createAsyncThunk(
  'statistics/getStatisticCard',
  async (managerId: number, { rejectWithValue }) => {
    try {
      const data = await statisticsApi.getStatisticCard(managerId);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get statistic card');
    }
  }
);

export const getPieChartDoneCancel = createAsyncThunk(
  'statistics/getPieChartDoneCancel',
  async (managerId: number, { rejectWithValue }) => {
    try {
      const data = await statisticsApi.getPieChartDoneCancel(managerId);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get pie chart data');
    }
  }
);

export const getRevenueChart = createAsyncThunk(
  'statistics/getRevenueChart',
  async (params: RevenueChartParams, { rejectWithValue }) => {
    try {
      const data = await statisticsApi.getRevenueChart(params);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get revenue chart data');
    }
  }
);

export const getParkingStatisticCard = createAsyncThunk(
  'statistics/getParkingStatisticCard',
  async (parkingId: number, { rejectWithValue }) => {
    try {
      const data = await statisticsApi.getParkingStatisticCard(parkingId);
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Failed to get parking statistic card'
      );
    }
  }
);

export const getParkingPieChart = createAsyncThunk(
  'statistics/getParkingPieChart',
  async (parkingId: number, { rejectWithValue }) => {
    try {
      const data = await statisticsApi.getParkingPieChart(parkingId);
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Failed to get parking pie chart data'
      );
    }
  }
);

export const getParkingRevenueChart = createAsyncThunk(
  'statistics/getParkingRevenueChart',
  async (
    { parkingId, week, month }: { parkingId: number; week?: number; month?: number },
    { rejectWithValue }
  ) => {
    try {
      const data = await statisticsApi.getParkingRevenueChart(parkingId, week, month);
      return data;
    } catch (error: any) {
      return rejectWithValue(
        error.message || 'Failed to get parking revenue chart data'
      );
    }
  }
);

// Slice
const statisticsSlice = createSlice({
  name: 'statistics',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetStatistics: (state) => {
      state.statisticCard = null;
      state.pieChartData = null;
      state.revenueChartData = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get Statistic Card
      .addCase(getStatisticCard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getStatisticCard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.statisticCard = action.payload;
      })
      .addCase(getStatisticCard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Get Pie Chart Done/Cancel
      .addCase(getPieChartDoneCancel.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getPieChartDoneCancel.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pieChartData = action.payload;
      })
      .addCase(getPieChartDoneCancel.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Get Revenue Chart
      .addCase(getRevenueChart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getRevenueChart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.revenueChartData = action.payload;
      })
      .addCase(getRevenueChart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Get Parking Statistic Card
      .addCase(getParkingStatisticCard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getParkingStatisticCard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.statisticCard = action.payload;
      })
      .addCase(getParkingStatisticCard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Get Parking Pie Chart
      .addCase(getParkingPieChart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getParkingPieChart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pieChartData = action.payload;
      })
      .addCase(getParkingPieChart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Get Parking Revenue Chart
      .addCase(getParkingRevenueChart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getParkingRevenueChart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.revenueChartData = action.payload;
      })
      .addCase(getParkingRevenueChart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, resetStatistics } = statisticsSlice.actions;
export default statisticsSlice.reducer;

