import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import partnerReducer from './slices/partnerSlice';
import leadReducer from './slices/leadSlice';
import dashboardReducer from './slices/dashboardSlice';
import contactReducer from './slices/contactSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    partner: partnerReducer,
    lead: leadReducer,
    dashboard: dashboardReducer,
    contact: contactReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;