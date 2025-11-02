import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  Booking, 
  BookingFilter, 
  BookingStatus,
  GetAllBookingByKeeperIdResponse 
} from '../../types';
import { bookingApi } from '../../services/api/endpoints/bookingApi';
import { DEFAULT_PAGE_SIZE, DEFAULT_PAGE_NO } from '../../utils/constants';

interface BookingState {
  bookings: GetAllBookingByKeeperIdResponse[];
  currentBooking: GetAllBookingByKeeperIdResponse | null;
  filters: BookingFilter;
  pagination: {
    pageNo: number;
    pageSize: number;
    hasMore: boolean;
    totalCount?: number;
  };
  isLoading: boolean;
  error: string | null;
  searchResults: Booking[];
}

const initialState: BookingState = {
  bookings: [],
  currentBooking: null,
  filters: {
    date: undefined,
    status: undefined,
    searchString: undefined,
  },
  pagination: {
    pageNo: DEFAULT_PAGE_NO,
    pageSize: DEFAULT_PAGE_SIZE,
    hasMore: true,
  },
  isLoading: false,
  error: null,
  searchResults: [],
};

// Async thunks
export const getAllBookings = createAsyncThunk(
  'booking/getAllBookings',
  async (
    { keeperId, pageNo, pageSize }: { keeperId: number; pageNo?: number; pageSize?: number },
    { rejectWithValue }
  ) => {
    try {
      const data = await bookingApi.getAllBookings(
        keeperId,
        pageNo || DEFAULT_PAGE_NO,
        pageSize || DEFAULT_PAGE_SIZE
      );
      return { data, pageNo: pageNo || DEFAULT_PAGE_NO, hasMore: data.length === (pageSize || DEFAULT_PAGE_SIZE) };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get bookings');
    }
  }
);

export const searchBookings = createAsyncThunk(
  'booking/searchBookings',
  async (
    { keeperId, searchString }: { keeperId: number; searchString: string },
    { rejectWithValue }
  ) => {
    try {
      const data = await bookingApi.searchBooking(keeperId, searchString);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to search bookings');
    }
  }
);

export const filterBookings = createAsyncThunk(
  'booking/filterBookings',
  async (
    {
      keeperId,
      filters,
      pageNo,
      pageSize,
    }: {
      keeperId: number;
      filters: BookingFilter;
      pageNo?: number;
      pageSize?: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const data = await bookingApi.filterBookings(
        keeperId,
        filters,
        pageNo || DEFAULT_PAGE_NO,
        pageSize || DEFAULT_PAGE_SIZE
      );
      return { data, filters, pageNo: pageNo || DEFAULT_PAGE_NO, hasMore: data.length === (pageSize || DEFAULT_PAGE_SIZE) };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to filter bookings');
    }
  }
);

export const getBookingInfo = createAsyncThunk(
  'booking/getBookingInfo',
  async (bookingId: number, { rejectWithValue }) => {
    try {
      const data = await bookingApi.getBookingInfo(bookingId);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get booking info');
    }
  }
);

export const createPasserbyBooking = createAsyncThunk(
  'booking/createPasserbyBooking',
  async (data: any, { rejectWithValue }) => {
    try {
      const bookingId = await bookingApi.createPasserbyBooking(data);
      return bookingId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create booking');
    }
  }
);

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action: PayloadAction<BookingFilter>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.pageNo = DEFAULT_PAGE_NO;
      state.bookings = [];
    },
    clearFilters: (state) => {
      state.filters = {
        date: undefined,
        status: undefined,
        searchString: undefined,
      };
      state.pagination.pageNo = DEFAULT_PAGE_NO;
    },
    setCurrentBooking: (state, action: PayloadAction<GetAllBookingByKeeperIdResponse | null>) => {
      state.currentBooking = action.payload;
    },
    resetBookings: (state) => {
      state.bookings = [];
      state.pagination.pageNo = DEFAULT_PAGE_NO;
      state.pagination.hasMore = true;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Get All Bookings
    builder
      .addCase(getAllBookings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.meta.arg.pageNo === DEFAULT_PAGE_NO) {
          state.bookings = action.payload.data;
        } else {
          state.bookings = [...state.bookings, ...action.payload.data];
        }
        state.pagination.pageNo = action.payload.pageNo;
        state.pagination.hasMore = action.payload.hasMore;
      })
      .addCase(getAllBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Search Bookings
    builder
      .addCase(searchBookings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = action.payload as any;
      })
      .addCase(searchBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Filter Bookings
    builder
      .addCase(filterBookings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(filterBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.meta.arg.pageNo === DEFAULT_PAGE_NO) {
          state.bookings = action.payload.data;
        } else {
          state.bookings = [...state.bookings, ...action.payload.data];
        }
        state.filters = action.payload.filters;
        state.pagination.pageNo = action.payload.pageNo;
        state.pagination.hasMore = action.payload.hasMore;
      })
      .addCase(filterBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get Booking Info
    builder
      .addCase(getBookingInfo.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getBookingInfo.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBooking = action.payload as any;
      })
      .addCase(getBookingInfo.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Passerby Booking
    builder
      .addCase(createPasserbyBooking.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPasserbyBooking.fulfilled, (state) => {
        state.isLoading = false;
        // Reset to first page to show new booking
        state.pagination.pageNo = DEFAULT_PAGE_NO;
      })
      .addCase(createPasserbyBooking.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  setFilters,
  clearFilters,
  setCurrentBooking,
  resetBookings,
} = bookingSlice.actions;

export default bookingSlice.reducer;

