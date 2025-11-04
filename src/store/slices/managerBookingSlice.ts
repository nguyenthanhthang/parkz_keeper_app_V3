import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { managerBookingApi } from '../../services/api/endpoints/managerBookingApi';
import {
  Booking,
  ApproveBookingRequest,
  CheckoutBookingRequest,
  MarkBookingDoneRequest,
  BookingStatus,
} from '../../types';

interface ManagerBookingState {
  bookings: Booking[];
  currentBooking: Booking | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    status?: BookingStatus;
    date?: string;
    parkingId?: number;
  };
  pagination: {
    pageNo: number;
    pageSize: number;
    hasMore: boolean;
  };
}

const initialState: ManagerBookingState = {
  bookings: [],
  currentBooking: null,
  isLoading: false,
  error: null,
  filters: {},
  pagination: {
    pageNo: 1,
    pageSize: 10,
    hasMore: false,
  },
};

// Async thunks
export const getBookingsByManager = createAsyncThunk(
  'managerBooking/getBookingsByManager',
  async (
    { managerId, pageNo, pageSize }: { managerId: number; pageNo?: number; pageSize?: number },
    { rejectWithValue }
  ) => {
    try {
      const data = await managerBookingApi.getBookingsByManager(
        managerId,
        pageNo || 1,
        pageSize || 10
      );
      return { data, pageNo: pageNo || 1, hasMore: data.length === (pageSize || 10) };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get bookings');
    }
  }
);

export const getBookingsByParking = createAsyncThunk(
  'managerBooking/getBookingsByParking',
  async (
    { parkingId, pageNo, pageSize }: { parkingId: number; pageNo?: number; pageSize?: number },
    { rejectWithValue }
  ) => {
    try {
      const data = await managerBookingApi.getBookingsByParking(
        parkingId,
        pageNo || 1,
        pageSize || 10
      );
      return { data, pageNo: pageNo || 1, hasMore: data.length === (pageSize || 10) };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get bookings by parking');
    }
  }
);

export const getBookingDetail = createAsyncThunk(
  'managerBooking/getBookingDetail',
  async (bookingId: number, { rejectWithValue }) => {
    try {
      const data = await managerBookingApi.getBookingDetail(bookingId);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get booking detail');
    }
  }
);

export const approveBooking = createAsyncThunk(
  'managerBooking/approveBooking',
  async (data: ApproveBookingRequest, { rejectWithValue }) => {
    try {
      const booking = await managerBookingApi.approveBooking(data);
      return booking;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to approve booking');
    }
  }
);

export const checkoutBooking = createAsyncThunk(
  'managerBooking/checkoutBooking',
  async (data: CheckoutBookingRequest, { rejectWithValue }) => {
    try {
      const booking = await managerBookingApi.checkoutBooking(data);
      return booking;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to checkout booking');
    }
  }
);

export const markBookingDone = createAsyncThunk(
  'managerBooking/markBookingDone',
  async (data: MarkBookingDoneRequest, { rejectWithValue }) => {
    try {
      const booking = await managerBookingApi.markBookingDone(data);
      return booking;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to mark booking done');
    }
  }
);

const managerBookingSlice = createSlice({
  name: 'managerBooking',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentBooking: (state, action: PayloadAction<Booking | null>) => {
      state.currentBooking = action.payload;
    },
    setFilters: (
      state,
      action: PayloadAction<{
        status?: BookingStatus;
        date?: string;
        parkingId?: number;
      }>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.pageNo = 1; // Reset to first page when filter changes
    },
    clearFilters: (state) => {
      state.filters = {};
      state.pagination.pageNo = 1;
    },
    resetBookings: (state) => {
      state.bookings = [];
      state.currentBooking = null;
      state.pagination.pageNo = 1;
    },
  },
  extraReducers: (builder) => {
    // Get Bookings By Manager
    builder
      .addCase(getBookingsByManager.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getBookingsByManager.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.pageNo === 1) {
          state.bookings = action.payload.data;
        } else {
          state.bookings = [...state.bookings, ...action.payload.data];
        }
        state.pagination = {
          ...state.pagination,
          pageNo: action.payload.pageNo,
          hasMore: action.payload.hasMore,
        };
      })
      .addCase(getBookingsByManager.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get Bookings By Parking
    builder
      .addCase(getBookingsByParking.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getBookingsByParking.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.pageNo === 1) {
          state.bookings = action.payload.data;
        } else {
          state.bookings = [...state.bookings, ...action.payload.data];
        }
        state.pagination = {
          ...state.pagination,
          pageNo: action.payload.pageNo,
          hasMore: action.payload.hasMore,
        };
      })
      .addCase(getBookingsByParking.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get Booking Detail
    builder
      .addCase(getBookingDetail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getBookingDetail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBooking = action.payload;
        // Update in list if exists
        const index = state.bookings.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
      })
      .addCase(getBookingDetail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Approve Booking
    builder
      .addCase(approveBooking.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(approveBooking.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.bookings.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
        if (state.currentBooking?.id === action.payload.id) {
          state.currentBooking = action.payload;
        }
      })
      .addCase(approveBooking.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Checkout Booking
    builder
      .addCase(checkoutBooking.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkoutBooking.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.bookings.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
        if (state.currentBooking?.id === action.payload.id) {
          state.currentBooking = action.payload;
        }
      })
      .addCase(checkoutBooking.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Mark Booking Done
    builder
      .addCase(markBookingDone.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(markBookingDone.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.bookings.findIndex((b) => b.id === action.payload.id);
        if (index !== -1) {
          state.bookings[index] = action.payload;
        }
        if (state.currentBooking?.id === action.payload.id) {
          state.currentBooking = action.payload;
        }
      })
      .addCase(markBookingDone.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  setCurrentBooking,
  setFilters,
  clearFilters,
  resetBookings,
} = managerBookingSlice.actions;
export default managerBookingSlice.reducer;

