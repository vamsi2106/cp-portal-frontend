import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/api';
import { API_ROUTES } from '../../constants/apiRoutes';
import type { Lead, LeadHierarchy } from '../../types/lead';

interface LeadState {
  leads: Lead[];
  hierarchy: LeadHierarchy | null;
  loading: boolean;
  error: string | null;
}

const initialState: LeadState = {
  leads: [],
  hierarchy: null,
  loading: false,
  error: null,
};

export const fetchLeads = createAsyncThunk(
  'lead/fetchLeads',
  async () => {
    const response = await api.get<Lead[]>(API_ROUTES.LEADS.LIST);
    return response;
  }
);

export const fetchLeadHierarchy = createAsyncThunk(
  'lead/fetchLeadHierarchy',
  async (partnerId: string) => {
    const response = await api.get<LeadHierarchy>(
      API_ROUTES.LEADS.HIERARCHY(partnerId)
    );
    return response;
  }
);

const leadSlice = createSlice({
  name: 'lead',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeads.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.loading = false;
        state.leads = action.payload;
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch leads';
      })
      .addCase(fetchLeadHierarchy.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeadHierarchy.fulfilled, (state, action) => {
        state.loading = false;
        state.hierarchy = action.payload;
      })
      .addCase(fetchLeadHierarchy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch lead hierarchy';
      });
  },
});

export default leadSlice.reducer;