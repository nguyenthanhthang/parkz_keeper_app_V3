import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { pricingApi } from '../../services/api/endpoints/pricingApi';
import {
  ParkingPrice,
  CreateParkingPriceRequest,
  DisableEnableParkingPriceRequest,
  Timeline,
  CreateTimelineRequest,
  UpdateTimelineRequest,
  ParkingHasPrice,
  CreateParkingHasPriceRequest,
  UpdateParkingHasPriceRequest,
} from '../../types';

interface PricingState {
  parkingPrices: ParkingPrice[];
  currentParkingPrice: ParkingPrice | null;
  timelines: Timeline[];
  parkingHasPrices: ParkingHasPrice[];
  isLoading: boolean;
  error: string | null;
}

const initialState: PricingState = {
  parkingPrices: [],
  currentParkingPrice: null,
  timelines: [],
  parkingHasPrices: [],
  isLoading: false,
  error: null,
};

// Async thunks - Parking Price
export const getParkingPrices = createAsyncThunk(
  'pricing/getParkingPrices',
  async (_, { rejectWithValue }) => {
    try {
      const data = await pricingApi.getParkingPrices();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get parking prices');
    }
  }
);

export const createParkingPrice = createAsyncThunk(
  'pricing/createParkingPrice',
  async (data: CreateParkingPriceRequest, { rejectWithValue }) => {
    try {
      const price = await pricingApi.createParkingPrice(data);
      return price;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create parking price');
    }
  }
);

export const disableEnableParkingPrice = createAsyncThunk(
  'pricing/disableEnableParkingPrice',
  async (data: DisableEnableParkingPriceRequest, { rejectWithValue }) => {
    try {
      const price = await pricingApi.disableEnableParkingPrice(data);
      return price;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to disable/enable parking price');
    }
  }
);

// Async thunks - Timeline
export const getTimelinesByPrice = createAsyncThunk(
  'pricing/getTimelinesByPrice',
  async (parkingPriceId: number, { rejectWithValue }) => {
    try {
      const data = await pricingApi.getTimelinesByPrice(parkingPriceId);
      return { parkingPriceId, timelines: data };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get timelines');
    }
  }
);

export const createTimeline = createAsyncThunk(
  'pricing/createTimeline',
  async (data: CreateTimelineRequest, { rejectWithValue }) => {
    try {
      const timeline = await pricingApi.createTimeline(data);
      return timeline;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create timeline');
    }
  }
);

export const updateTimeline = createAsyncThunk(
  'pricing/updateTimeline',
  async (
    { timelineId, data }: { timelineId: number; data: UpdateTimelineRequest },
    { rejectWithValue }
  ) => {
    try {
      const timeline = await pricingApi.updateTimeline(timelineId, data);
      return timeline;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update timeline');
    }
  }
);

export const deleteTimeline = createAsyncThunk(
  'pricing/deleteTimeline',
  async (timelineId: number, { rejectWithValue }) => {
    try {
      await pricingApi.deleteTimeline(timelineId);
      return timelineId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete timeline');
    }
  }
);

// Async thunks - Parking Has Price
export const getParkingHasPriceList = createAsyncThunk(
  'pricing/getParkingHasPriceList',
  async (managerId?: number, { rejectWithValue }) => {
    try {
      const data = await pricingApi.getParkingHasPriceList(managerId);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get parking has price list');
    }
  }
);

export const createParkingHasPrice = createAsyncThunk(
  'pricing/createParkingHasPrice',
  async (data: CreateParkingHasPriceRequest, { rejectWithValue }) => {
    try {
      const parkingHasPrice = await pricingApi.createParkingHasPrice(data);
      return parkingHasPrice;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to assign price to parking');
    }
  }
);

export const deleteParkingHasPrice = createAsyncThunk(
  'pricing/deleteParkingHasPrice',
  async (
    { parkingId, parkingPriceId }: { parkingId: number; parkingPriceId: number },
    { rejectWithValue }
  ) => {
    try {
      await pricingApi.deleteParkingHasPrice(parkingId, parkingPriceId);
      return { parkingId, parkingPriceId };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete parking has price');
    }
  }
);

const pricingSlice = createSlice({
  name: 'pricing',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentParkingPrice: (state, action: PayloadAction<ParkingPrice | null>) => {
      state.currentParkingPrice = action.payload;
    },
    resetPricing: (state) => {
      state.parkingPrices = [];
      state.currentParkingPrice = null;
      state.timelines = [];
      state.parkingHasPrices = [];
    },
  },
  extraReducers: (builder) => {
    // Get Parking Prices
    builder
      .addCase(getParkingPrices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getParkingPrices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.parkingPrices = action.payload;
      })
      .addCase(getParkingPrices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Parking Price
    builder
      .addCase(createParkingPrice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createParkingPrice.fulfilled, (state, action) => {
        state.isLoading = false;
        state.parkingPrices.push(action.payload);
      })
      .addCase(createParkingPrice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Disable/Enable Parking Price
    builder
      .addCase(disableEnableParkingPrice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(disableEnableParkingPrice.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.parkingPrices.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.parkingPrices[index] = action.payload;
        }
        if (state.currentParkingPrice?.id === action.payload.id) {
          state.currentParkingPrice = action.payload;
        }
      })
      .addCase(disableEnableParkingPrice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get Timelines By Price
    builder
      .addCase(getTimelinesByPrice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTimelinesByPrice.fulfilled, (state, action) => {
        state.isLoading = false;
        state.timelines = action.payload.timelines;
      })
      .addCase(getTimelinesByPrice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Timeline
    builder
      .addCase(createTimeline.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTimeline.fulfilled, (state, action) => {
        state.isLoading = false;
        state.timelines.push(action.payload);
      })
      .addCase(createTimeline.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Timeline
    builder
      .addCase(updateTimeline.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateTimeline.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.timelines.findIndex((t) => t.id === action.payload.id);
        if (index !== -1) {
          state.timelines[index] = action.payload;
        }
      })
      .addCase(updateTimeline.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete Timeline
    builder
      .addCase(deleteTimeline.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteTimeline.fulfilled, (state, action) => {
        state.isLoading = false;
        state.timelines = state.timelines.filter((t) => t.id !== action.payload);
      })
      .addCase(deleteTimeline.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get Parking Has Price List
    builder
      .addCase(getParkingHasPriceList.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getParkingHasPriceList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.parkingHasPrices = action.payload;
      })
      .addCase(getParkingHasPriceList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Parking Has Price
    builder
      .addCase(createParkingHasPrice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createParkingHasPrice.fulfilled, (state, action) => {
        state.isLoading = false;
        state.parkingHasPrices.push(action.payload);
      })
      .addCase(createParkingHasPrice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete Parking Has Price
    builder
      .addCase(deleteParkingHasPrice.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteParkingHasPrice.fulfilled, (state, action) => {
        state.isLoading = false;
        state.parkingHasPrices = state.parkingHasPrices.filter(
          (php) =>
            !(
              php.parkingId === action.payload.parkingId &&
              php.parkingPriceId === action.payload.parkingPriceId
            )
        );
      })
      .addCase(deleteParkingHasPrice.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentParkingPrice, resetPricing } = pricingSlice.actions;
export default pricingSlice.reducer;

