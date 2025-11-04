import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { floorApi } from '../../services/api/endpoints/floorApi';
import {
  Floor,
  CreateFloorRequest,
  UpdateFloorRequest,
} from '../../types';

interface FloorState {
  floors: Floor[];
  currentFloor: Floor | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: FloorState = {
  floors: [],
  currentFloor: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const getAllFloors = createAsyncThunk(
  'floor/getAllFloors',
  async (parkingId?: number, { rejectWithValue }) => {
    try {
      const data = await floorApi.getAllFloors(parkingId);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get floors');
    }
  }
);

export const getFloorsByParking = createAsyncThunk(
  'floor/getFloorsByParking',
  async (parkingId: number, { rejectWithValue }) => {
    try {
      const data = await floorApi.getFloorsByParking(parkingId);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get floors by parking');
    }
  }
);

export const createFloor = createAsyncThunk(
  'floor/createFloor',
  async (data: CreateFloorRequest, { rejectWithValue }) => {
    try {
      const floor = await floorApi.createFloor(data);
      return floor;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create floor');
    }
  }
);

export const updateFloor = createAsyncThunk(
  'floor/updateFloor',
  async (
    { floorId, data }: { floorId: number; data: UpdateFloorRequest },
    { rejectWithValue }
  ) => {
    try {
      const floor = await floorApi.updateFloor(floorId, data);
      return floor;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update floor');
    }
  }
);

export const deleteFloor = createAsyncThunk(
  'floor/deleteFloor',
  async (floorId: number, { rejectWithValue }) => {
    try {
      await floorApi.deleteFloor(floorId);
      return floorId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete floor');
    }
  }
);

const floorSlice = createSlice({
  name: 'floor',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentFloor: (state, action: PayloadAction<Floor | null>) => {
      state.currentFloor = action.payload;
    },
    resetFloors: (state) => {
      state.floors = [];
      state.currentFloor = null;
    },
  },
  extraReducers: (builder) => {
    // Get All Floors
    builder
      .addCase(getAllFloors.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllFloors.fulfilled, (state, action) => {
        state.isLoading = false;
        state.floors = action.payload;
      })
      .addCase(getAllFloors.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get Floors By Parking
    builder
      .addCase(getFloorsByParking.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getFloorsByParking.fulfilled, (state, action) => {
        state.isLoading = false;
        state.floors = action.payload;
      })
      .addCase(getFloorsByParking.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Floor
    builder
      .addCase(createFloor.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createFloor.fulfilled, (state, action) => {
        state.isLoading = false;
        state.floors.push(action.payload);
      })
      .addCase(createFloor.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Floor
    builder
      .addCase(updateFloor.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateFloor.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.floors.findIndex((f) => f.id === action.payload.id);
        if (index !== -1) {
          state.floors[index] = action.payload;
        }
        if (state.currentFloor?.id === action.payload.id) {
          state.currentFloor = action.payload;
        }
      })
      .addCase(updateFloor.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete Floor
    builder
      .addCase(deleteFloor.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteFloor.fulfilled, (state, action) => {
        state.isLoading = false;
        state.floors = state.floors.filter((f) => f.id !== action.payload);
        if (state.currentFloor?.id === action.payload) {
          state.currentFloor = null;
        }
      })
      .addCase(deleteFloor.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentFloor, resetFloors } = floorSlice.actions;
export default floorSlice.reducer;

