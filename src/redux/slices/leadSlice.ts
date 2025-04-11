
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/api';
import { API_ROUTES } from '../../config/apiRoutes';
import type { LeadHierarchy } from '../../types/lead';

interface LeadHierarchyState {
    hierarchy: LeadHierarchy | null;
    loading: boolean;
    error: string | null;
}

const initialState: LeadHierarchyState = {
    hierarchy: null,
    loading: false,
    error: null,
};

export const fetchLeadHierarchy = createAsyncThunk(
    'lead/fetchLeadHierarchy',
    async (partnerId: string) => {
        const response: any = await api.get<LeadHierarchy>(API_ROUTES.LEADS.HIERARCHY(partnerId));
        return response.data.data; // Extracting the nested "data"
    }
);

const leadHierarchySlice = createSlice({
    name: 'leadHierarchy',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
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

export default leadHierarchySlice.reducer;
