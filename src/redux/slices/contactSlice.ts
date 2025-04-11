import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/api';
import { API_ROUTES } from '../../config/apiRoutes';
import type { ContactHierarchy } from '../../types/contact';

interface ContactState {
  hierarchy: ContactHierarchy['data'] | null;
  loading: boolean;
  error: string | null;
}

const initialState: ContactState = {
  hierarchy: null,
  loading: false,
  error: null,
};

export const fetchContactHierarchy = createAsyncThunk(
  'contact/fetchContactHierarchy',
  async (partnerId: string) => {
    try {
      console.log('Fetching contact hierarchy for partner ID:', partnerId);
      const response: any = await api.get(API_ROUTES.CONTACTS.HIERARCHY(partnerId));
      console.log('Contact hierarchy response:', response);
      return response.data.data; // Extracting the nested "data"
    } catch (error) {
      console.error('Error fetching contact hierarchy:', error);
      throw error;
    }
  }
);

const contactSlice = createSlice({
  name: 'contact',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchContactHierarchy.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContactHierarchy.fulfilled, (state, action) => {
        state.loading = false;
        state.hierarchy = action.payload;
      })
      .addCase(fetchContactHierarchy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch contact hierarchy';
      });
  },
});

export default contactSlice.reducer;
