import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { slotApi } from '../../services/api/endpoints/slotApi';
import {
  ParkingSlot,
  CreateSlotRequest,
  UpdateSlotRequest,
} from '../../types';

interface SlotState {
  slots: ParkingSlot[];
  currentSlots: ParkingSlot[]; // Slots của floor hiện tại
  currentFloorId: number | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: SlotState = {
  slots: [],
  currentSlots: [],
  currentFloorId: null,
  isLoading: false,
  error: null,
};

// Async thunks
export const getSlotsByFloor = createAsyncThunk(
  'slot/getSlotsByFloor',
  async (floorId: number, { rejectWithValue }) => {
    try {
      const data = await slotApi.getSlotsByFloor(floorId);
      return { floorId, slots: data };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get slots by floor');
    }
  }
);

export const createSlot = createAsyncThunk(
  'slot/createSlot',
  async (data: CreateSlotRequest, { rejectWithValue }) => {
    try {
      const slot = await slotApi.createSlot(data);
      return slot;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create slot');
    }
  }
);

export const updateSlot = createAsyncThunk(
  'slot/updateSlot',
  async (
    { slotId, data }: { slotId: number; data: UpdateSlotRequest },
    { rejectWithValue }
  ) => {
    try {
      const slot = await slotApi.updateSlot(slotId, data);
      return slot;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update slot');
    }
  }
);

const slotSlice = createSlice({
  name: 'slot',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentFloorId: (state, action: PayloadAction<number | null>) => {
      state.currentFloorId = action.payload;
      if (!action.payload) {
        state.currentSlots = [];
      }
    },
    resetSlots: (state) => {
      state.slots = [];
      state.currentSlots = [];
      state.currentFloorId = null;
    },
  },
  extraReducers: (builder) => {
    // Get Slots By Floor
    builder
      .addCase(getSlotsByFloor.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSlotsByFloor.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentFloorId = action.payload.floorId;
        state.currentSlots = action.payload.slots;
      })
      .addCase(getSlotsByFloor.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Slot
    builder
      .addCase(createSlot.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createSlot.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSlots.push(action.payload);
        state.slots.push(action.payload);
      })
      .addCase(createSlot.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Update Slot
    builder
      .addCase(updateSlot.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateSlot.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.currentSlots.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.currentSlots[index] = action.payload;
        }
        const allIndex = state.slots.findIndex((s) => s.id === action.payload.id);
        if (allIndex !== -1) {
          state.slots[allIndex] = action.payload;
        }
      })
      .addCase(updateSlot.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError: clearSlotError, setCurrentFloorId, resetSlots } =
  slotSlice.actions;
export default slotSlice.reducer;

