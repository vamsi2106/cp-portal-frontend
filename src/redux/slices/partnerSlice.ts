import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/api';
import { API_ROUTES } from '../../constants/apiRoutes';
import type { Partner, PartnerDetail, PartnerHierarchy } from '../../types/partner';

interface PartnerState {
  partners: Partner[];
  currentPartner: PartnerDetail | null;
  hierarchy: PartnerHierarchy | null;
  loading: boolean;
  error: string | null;
}

const initialState: PartnerState = {
  partners: [],
  currentPartner: null,
  hierarchy: null,
  loading: false,
  error: null,
};

export const fetchPartners = createAsyncThunk(
  'partner/fetchPartners',
  async () => {
    const response = await api.get<Partner[]>(API_ROUTES.PARTNERS.LIST);
    return response;
  }
);

export const fetchPartnerDetail = createAsyncThunk(
  'partner/fetchPartnerDetail',
  async (id: string) => {
    const response = await api.get<PartnerDetail>(API_ROUTES.PARTNERS.DETAIL(id));
    return response;
  }
);

export const fetchPartnerHierarchy = createAsyncThunk(
  'partner/fetchPartnerHierarchy',
  async (partnerId: string) => {
    const response = await api.get<PartnerHierarchy>(
      API_ROUTES.PARTNERS.HIERARCHY(partnerId)
    );
    return response;
  }
);

const partnerSlice = createSlice({
  name: 'partner',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPartners.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPartners.fulfilled, (state, action) => {
        state.loading = false;
        state.partners = action.payload;
      })
      .addCase(fetchPartners.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch partners';
      })
      .addCase(fetchPartnerDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPartnerDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPartner = action.payload;
      })
      .addCase(fetchPartnerDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch partner details';
      })
      .addCase(fetchPartnerHierarchy.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPartnerHierarchy.fulfilled, (state, action) => {
        state.loading = false;
        state.hierarchy = action.payload;
      })
      .addCase(fetchPartnerHierarchy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch partner hierarchy';
      });
  },
});

export default partnerSlice.reducer;