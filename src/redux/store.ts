import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import partnerReducer from './slices/partnerSlice';
import leadReducer from './slices/leadSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    partner: partnerReducer,
    lead: leadReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;