import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User, LoginCredentials, UserRole } from '../../types';
import { authApi } from '../../services/api/endpoints/authApi';
import { parkingApi } from '../../services/api/endpoints/parkingApi';
import { tokenStorage, userStorage } from '../../utils/storage';

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials);
      
      // Nếu là Keeper và có userId nhưng không có parkingName, fetch keeper info để lấy đầy đủ thông tin
      let user = response.user;
      if (
        (user.role === UserRole.KEEPER || user.role === 'Keeper') &&
        user.id &&
        !user.parkingName
      ) {
        try {
          // Gọi API getKeeperInfo để lấy thông tin đầy đủ
          const keeperInfo = await authApi.getKeeperInfo(user.id);
          // Merge thông tin từ keeperInfo vào user
          const finalParkingId = keeperInfo.parkingId || user.parkingId;
          let finalParkingName = keeperInfo.parkingName || user.parkingName;
          
          // Nếu vẫn không có parkingName nhưng có parkingId, fetch từ parking API
          if (finalParkingId && !finalParkingName) {
            try {
              const parking = await parkingApi.getParkingById(finalParkingId);
              finalParkingName = parking.name;
            } catch (parkingError: any) {
              console.warn('Failed to fetch parking name from parking API:', parkingError.message);
            }
          }
          
          user = {
            ...user,
            parkingId: finalParkingId,
            parkingName: finalParkingName,
            phone: keeperInfo.phone || user.phone,
          };
          // Update response với user mới
          response.user = user;
        } catch (keeperError: any) {
          // Nếu không fetch được keeper info, thử fetch parking trực tiếp nếu có parkingId
          if (user.parkingId && !user.parkingName) {
            try {
              const parking = await parkingApi.getParkingById(user.parkingId);
              user = {
                ...user,
                parkingName: parking.name,
              };
              response.user = user;
            } catch (parkingError: any) {
              console.warn('Failed to fetch parking name:', parkingError.message);
            }
          }
        }
      }
      
      // Save token and user to storage
      await tokenStorage.saveToken(response.token);
      await userStorage.saveUser(user);
      
      return {
        ...response,
        user,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      // Chỉ check storage, không fetch API để tránh block app start
      // ParkingName sẽ được fetch sau khi vào app (trong Dashboard hoặc Profile)
      const token = await tokenStorage.getToken();
      const user = await userStorage.getUser();
      
      if (token && user) {
        return { token, user };
      }
      
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to check auth');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await tokenStorage.removeToken();
      await userStorage.removeUser();
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

// DEV ONLY: Mock login để bypass API call
export const mockLogin = createAsyncThunk(
  'auth/mockLogin',
  async (role: string = 'Keeper', { rejectWithValue }) => {
    try {
      const mockToken = 'mock_token_dev_only';
      const mockUser: any = {
        id: 1,
        email: role === 'Manager' ? 'newmanager@parkz.com' : 'newkeeper@parkz.com',
        name: `Mock ${role}`,
        role: role,
        // Thêm parkingId cho Keeper để test các màn hình sau
        ...(role === 'Keeper' || role === UserRole.KEEPER ? { parkingId: 1 } : {}),
      };

      // Lưu vào storage
      await tokenStorage.saveToken(mockToken);
      await userStorage.saveUser(mockUser);

      return {
        token: mockToken,
        user: mockUser as User,
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Mock login failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // Check Auth
    builder
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.token = action.payload.token;
          state.user = action.payload.user;
          state.isAuthenticated = true;
        } else {
          state.token = null;
          state.user = null;
          state.isAuthenticated = false;
        }
      })
      .addCase(checkAuth.rejected, (state) => {
        state.isLoading = false;
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
      });

    // Logout
    builder
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Mock Login (DEV ONLY)
    builder
      .addCase(mockLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(mockLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(mockLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Clear Auth (for dev/testing - same as logout but doesn't call API)
    builder
      .addCase(clearAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(clearAuth.fulfilled, (state) => {
        state.isLoading = false;
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(clearAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Clear auth data action (for dev/testing - clears storage without API call)
export const clearAuth = createAsyncThunk(
  'auth/clearAuth',
  async (_, { rejectWithValue }) => {
    try {
      await tokenStorage.removeToken();
      await userStorage.removeUser();
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to clear auth');
    }
  }
);

export const { clearError, setUser } = authSlice.actions;
export default authSlice.reducer;

