import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { businessProfileApi } from '../../services/api/endpoints/businessProfileApi';
import {
  BusinessProfile,
  CreateBusinessProfileRequest,
} from '../../types';

interface BusinessProfileState {
  businessProfile: BusinessProfile | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: BusinessProfileState = {
  businessProfile: null,
  isLoading: false,
  error: null,
};

// Async Thunks
export const createBusinessProfile = createAsyncThunk(
  'businessProfile/createBusinessProfile',
  async (data: CreateBusinessProfileRequest, { rejectWithValue }) => {
    try {
      const profile = await businessProfileApi.createBusinessProfile(data);
      return profile;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create business profile');
    }
  }
);

export const getBusinessProfileByUser = createAsyncThunk(
  'businessProfile/getBusinessProfileByUser',
  async (userId: number, { rejectWithValue }) => {
    try {
      const profile = await businessProfileApi.getBusinessProfileByUser(userId);
      return profile;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get business profile');
    }
  }
);

export const getBusinessProfileByManager = createAsyncThunk(
  'businessProfile/getBusinessProfileByManager',
  async (managerId: number, { rejectWithValue }) => {
    try {
      console.log('Slice: Getting business profile for managerId:', managerId);
      const profile = await businessProfileApi.getBusinessProfileByManager(managerId);
      console.log('Slice: Received profile:', profile);
      return profile;
    } catch (error: any) {
      console.error('Slice: Error getting business profile:', error);
      return rejectWithValue(error.message || 'Failed to get business profile');
    }
  }
);

const businessProfileSlice = createSlice({
  name: 'businessProfile',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetBusinessProfile: (state) => {
      state.businessProfile = null;
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // createBusinessProfile
      .addCase(createBusinessProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createBusinessProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.businessProfile = action.payload;
      })
      .addCase(createBusinessProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // getBusinessProfileByUser
      .addCase(getBusinessProfileByUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getBusinessProfileByUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.businessProfile = action.payload;
      })
      .addCase(getBusinessProfileByUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // getBusinessProfileByManager
      .addCase(getBusinessProfileByManager.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getBusinessProfileByManager.fulfilled, (state, action) => {
        state.isLoading = false;
        state.businessProfile = action.payload;
      })
      .addCase(getBusinessProfileByManager.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, resetBusinessProfile } = businessProfileSlice.actions;
export default businessProfileSlice.reducer;

