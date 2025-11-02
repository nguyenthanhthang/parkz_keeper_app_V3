import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import bookingReducer from './slices/bookingSlice';
import parkingReducer from './slices/parkingSlice';
import statisticsReducer from './slices/statisticsSlice';
import businessProfileReducer from './slices/businessProfileSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    booking: bookingReducer,
    parking: parkingReducer,
    statistics: statisticsReducer,
    businessProfile: businessProfileReducer,
    // Add other reducers here as needed
    // slot: slotReducer,
    // conflict: conflictReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

