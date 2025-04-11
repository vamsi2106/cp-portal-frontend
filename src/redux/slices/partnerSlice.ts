import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/api';
import { API_ROUTES } from '../../config/apiRoutes';
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
    console.log('Partner hierarchy API response:', response);
    return response;
  }
);

const partnerSlice = createSlice({
  name: 'partner',
  initialState,
  reducers: {
    addPartnerOptimistically(state: any, action: any) {
      if (state.hierarchy?.Sub_Partners) {
        state.hierarchy.Sub_Partners.push({
          id: action.payload.id,
          Name: action.payload.Name,
          Phone_Number: action.payload.Phone_Number,
          Email: action.payload.Email,
          Reporting_To_Partner: state.hierarchy.name,
          Sub_Partners: [],
        });
      }
    },
  },
  extraReducers: (builder) => {
    builder
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


export const { addPartnerOptimistically } = partnerSlice.actions;
export default partnerSlice.reducer;