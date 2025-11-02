import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { parkingApi } from '../../services/api/endpoints/parkingApi';
import {
  Parking,
  CreateParkingRequest,
  UpdateParkingRequest,
  UpdateParkingLocationRequest,
  DisableParkingByDateRequest,
  DisableParkingByDateTimeRequest,
  EnableDisableParkingAtDateRequest,
  CancelDisableScheduledRequest,
  ScheduledDisableHistory,
  SuccessedDisableHistory,
} from '../../types';

interface ParkingState {
  parkings: Parking[];
  currentParking: Parking | null;
  scheduledDisableHistory: ScheduledDisableHistory[];
  successedDisableHistory: SuccessedDisableHistory[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
}

const initialState: ParkingState = {
  parkings: [],
  currentParking: null,
  scheduledDisableHistory: [],
  successedDisableHistory: [],
  isLoading: false,
  error: null,
  searchQuery: '',
};

// Async thunks
export const getAllParkings = createAsyncThunk(
  'parking/getAllParkings',
  async (
    { managerId, pageNo, pageSize }: { managerId?: number; pageNo?: number; pageSize?: number } = {},
    { rejectWithValue }
  ) => {
    try {
      const data = await parkingApi.getAllParkings(managerId, pageNo, pageSize);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get parkings');
    }
  }
);

export const getParkingById = createAsyncThunk(
  'parking/getParkingById',
  async (parkingId: number, { rejectWithValue }) => {
    try {
      const data = await parkingApi.getParkingById(parkingId);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get parking');
    }
  }
);

export const createParking = createAsyncThunk(
  'parking/createParking',
  async (data: CreateParkingRequest, { rejectWithValue }) => {
    try {
      const parking = await parkingApi.createParking(data);
      return parking;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create parking');
    }
  }
);

export const updateParking = createAsyncThunk(
  'parking/updateParking',
  async (
    { parkingId, data }: { parkingId: number; data: UpdateParkingRequest },
    { rejectWithValue }
  ) => {
    try {
      const parking = await parkingApi.updateParking(parkingId, data);
      return parking;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update parking');
    }
  }
);

export const updateParkingLocation = createAsyncThunk(
  'parking/updateParkingLocation',
  async (
    { parkingId, data }: { parkingId: number; data: UpdateParkingLocationRequest },
    { rejectWithValue }
  ) => {
    try {
      const parking = await parkingApi.updateParkingLocation(parkingId, data);
      return parking;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update parking location');
    }
  }
);

export const deleteParking = createAsyncThunk(
  'parking/deleteParking',
  async (parkingId: number, { rejectWithValue }) => {
    try {
      await parkingApi.deleteParking(parkingId);
      return parkingId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete parking');
    }
  }
);

export const markParkingFull = createAsyncThunk(
  'parking/markParkingFull',
  async (parkingId: number, { rejectWithValue }) => {
    try {
      const parking = await parkingApi.markParkingFull(parkingId);
      return parking;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to mark parking as full');
    }
  }
);

export const disableParkingByDate = createAsyncThunk(
  'parking/disableParkingByDate',
  async (data: DisableParkingByDateRequest, { rejectWithValue }) => {
    try {
      await parkingApi.disableParkingByDate(data);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to disable parking');
    }
  }
);

export const disableParkingByDateTime = createAsyncThunk(
  'parking/disableParkingByDateTime',
  async (data: DisableParkingByDateTimeRequest, { rejectWithValue }) => {
    try {
      await parkingApi.disableParkingByDateTime(data);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to disable parking');
    }
  }
);

export const enableDisableParkingAtDate = createAsyncThunk(
  'parking/enableDisableParkingAtDate',
  async (data: EnableDisableParkingAtDateRequest, { rejectWithValue }) => {
    try {
      await parkingApi.enableDisableParkingAtDate(data);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to enable/disable parking');
    }
  }
);

export const cancelDisableScheduled = createAsyncThunk(
  'parking/cancelDisableScheduled',
  async (data: CancelDisableScheduledRequest, { rejectWithValue }) => {
    try {
      await parkingApi.cancelDisableScheduled(data);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to cancel scheduled disable');
    }
  }
);

export const getScheduledDisableHistory = createAsyncThunk(
  'parking/getScheduledDisableHistory',
  async (parkingId?: number, { rejectWithValue }) => {
    try {
      const data = await parkingApi.getScheduledDisableHistory(parkingId);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get scheduled disable history');
    }
  }
);

export const getSuccessedDisableHistory = createAsyncThunk(
  'parking/getSuccessedDisableHistory',
  async (parkingId?: number, { rejectWithValue }) => {
    try {
      const data = await parkingApi.getSuccessedDisableHistory(parkingId);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get successed disable history');
    }
  }
);

const parkingSlice = createSlice({
  name: 'parking',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentParking: (state, action: PayloadAction<Parking | null>) => {
      state.currentParking = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    resetParkings: (state) => {
      state.parkings = [];
      state.currentParking = null;
      state.searchQuery = '';
    },
  },
  extraReducers: (builder) => {
    // Get All Parkings
    builder
      .addCase(getAllParkings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllParkings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.parkings = action.payload;
      })
      .addCase(getAllParkings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get Parking By ID
    builder
      .addCase(getParkingById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getParkingById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentParking = action.payload;
        // Update in list if exists
        const index = state.parkings.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.parkings[index] = action.payload;
        }
      })
      .addCase(getParkingById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Parking
    builder
      .addCase(createParking.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createParking.fulfilled, (state, action) => {
        state.isLoading = false;
        state.parkings.push(action.payload);
      })
      .addCase(createParking.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Parking
    builder
      .addCase(updateParking.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateParking.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.parkings.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.parkings[index] = action.payload;
        }
        if (state.currentParking?.id === action.payload.id) {
          state.currentParking = action.payload;
        }
      })
      .addCase(updateParking.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Parking Location
    builder
      .addCase(updateParkingLocation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateParkingLocation.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.parkings.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.parkings[index] = action.payload;
        }
        if (state.currentParking?.id === action.payload.id) {
          state.currentParking = action.payload;
        }
      })
      .addCase(updateParkingLocation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete Parking
    builder
      .addCase(deleteParking.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteParking.fulfilled, (state, action) => {
        state.isLoading = false;
        state.parkings = state.parkings.filter((p) => p.id !== action.payload);
        if (state.currentParking?.id === action.payload) {
          state.currentParking = null;
        }
      })
      .addCase(deleteParking.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Mark Parking Full
    builder
      .addCase(markParkingFull.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(markParkingFull.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.parkings.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.parkings[index] = action.payload;
        }
        if (state.currentParking?.id === action.payload.id) {
          state.currentParking = action.payload;
        }
      })
      .addCase(markParkingFull.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Disable Parking By Date
    builder
      .addCase(disableParkingByDate.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(disableParkingByDate.fulfilled, (state) => {
        state.isLoading = false;
        // Refresh scheduled history
      })
      .addCase(disableParkingByDate.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Disable Parking By DateTime
    builder
      .addCase(disableParkingByDateTime.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(disableParkingByDateTime.fulfilled, (state) => {
        state.isLoading = false;
        // Refresh scheduled history
      })
      .addCase(disableParkingByDateTime.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Enable/Disable Parking At Date
    builder
      .addCase(enableDisableParkingAtDate.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(enableDisableParkingAtDate.fulfilled, (state) => {
        state.isLoading = false;
        // Refresh scheduled history
      })
      .addCase(enableDisableParkingAtDate.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Cancel Disable Scheduled
    builder
      .addCase(cancelDisableScheduled.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelDisableScheduled.fulfilled, (state) => {
        state.isLoading = false;
        // Refresh scheduled history
      })
      .addCase(cancelDisableScheduled.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get Scheduled Disable History
    builder
      .addCase(getScheduledDisableHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getScheduledDisableHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.scheduledDisableHistory = action.payload;
      })
      .addCase(getScheduledDisableHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get Successed Disable History
    builder
      .addCase(getSuccessedDisableHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSuccessedDisableHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successedDisableHistory = action.payload;
      })
      .addCase(getSuccessedDisableHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentParking, setSearchQuery, resetParkings } =
  parkingSlice.actions;
export default parkingSlice.reducer;
