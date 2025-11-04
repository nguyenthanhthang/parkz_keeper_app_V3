import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import bookingReducer from './slices/bookingSlice';
import parkingReducer from './slices/parkingSlice';
import statisticsReducer from './slices/statisticsSlice';
import businessProfileReducer from './slices/businessProfileSlice';
import floorReducer from './slices/floorSlice';
import slotReducer from './slices/slotSlice';
import managerBookingReducer from './slices/managerBookingSlice';
import pricingReducer from './slices/pricingSlice';
import keeperReducer from './slices/keeperSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    booking: bookingReducer,
    parking: parkingReducer,
    statistics: statisticsReducer,
    businessProfile: businessProfileReducer,
    floor: floorReducer,
    slot: slotReducer,
    managerBooking: managerBookingReducer,
    pricing: pricingReducer,
    keeper: keeperReducer,
    // Add other reducers here as needed
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

