import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { keeperApi, Keeper, CreateKeeperRequest } from '../../services/api/endpoints/keeperApi';

interface KeeperState {
  keepers: Keeper[];
  currentKeeper: Keeper | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    pageNo: number;
    pageSize: number;
    hasMore: boolean;
  };
}

const initialState: KeeperState = {
  keepers: [],
  currentKeeper: null,
  isLoading: false,
  error: null,
  pagination: {
    pageNo: 1,
    pageSize: 10,
    hasMore: false,
  },
};

// Async thunks
export const getKeeperAccounts = createAsyncThunk(
  'keeper/getKeeperAccounts',
  async (
    { managerId, pageNo, pageSize }: { managerId: number; pageNo?: number; pageSize?: number },
    { rejectWithValue }
  ) => {
    try {
      const data = await keeperApi.getKeeperAccounts(managerId, pageNo || 1, pageSize || 10);
      return { data, pageNo: pageNo || 1, hasMore: data.length === (pageSize || 10) };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get keeper accounts');
    }
  }
);

export const createKeeper = createAsyncThunk(
  'keeper/createKeeper',
  async (data: CreateKeeperRequest, { rejectWithValue }) => {
    try {
      const keeper = await keeperApi.createKeeper(data);
      return keeper;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create keeper');
    }
  }
);

export const getKeeperDetail = createAsyncThunk(
  'keeper/getKeeperDetail',
  async (userId: number, { rejectWithValue }) => {
    try {
      const data = await keeperApi.getKeeperDetail(userId);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get keeper detail');
    }
  }
);

export const deleteKeeper = createAsyncThunk(
  'keeper/deleteKeeper',
  async (keeperId: number, { rejectWithValue }) => {
    try {
      await keeperApi.deleteKeeper(keeperId);
      return keeperId;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete keeper');
    }
  }
);

const keeperSlice = createSlice({
  name: 'keeper',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentKeeper: (state, action: PayloadAction<Keeper | null>) => {
      state.currentKeeper = action.payload;
    },
    resetKeepers: (state) => {
      state.keepers = [];
      state.currentKeeper = null;
      state.pagination.pageNo = 1;
    },
  },
  extraReducers: (builder) => {
    // Get Keeper Accounts
    builder
      .addCase(getKeeperAccounts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getKeeperAccounts.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.pageNo === 1) {
          state.keepers = action.payload.data;
        } else {
          state.keepers = [...state.keepers, ...action.payload.data];
        }
        state.pagination = {
          ...state.pagination,
          pageNo: action.payload.pageNo,
          hasMore: action.payload.hasMore,
        };
      })
      .addCase(getKeeperAccounts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create Keeper
    builder
      .addCase(createKeeper.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createKeeper.fulfilled, (state, action) => {
        state.isLoading = false;
        state.keepers.push(action.payload);
      })
      .addCase(createKeeper.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Get Keeper Detail
    builder
      .addCase(getKeeperDetail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getKeeperDetail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentKeeper = action.payload;
        // Update in list if exists
        const index = state.keepers.findIndex((k) => k.id === action.payload.id);
        if (index !== -1) {
          state.keepers[index] = action.payload;
        }
      })
      .addCase(getKeeperDetail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Delete Keeper
    builder
      .addCase(deleteKeeper.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteKeeper.fulfilled, (state, action) => {
        state.isLoading = false;
        state.keepers = state.keepers.filter((k) => k.id !== action.payload);
        if (state.currentKeeper?.id === action.payload) {
          state.currentKeeper = null;
        }
      })
      .addCase(deleteKeeper.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentKeeper, resetKeepers } = keeperSlice.actions;
export default keeperSlice.reducer;

