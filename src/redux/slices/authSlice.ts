import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/api';
import { API_ROUTES } from '../../config/apiRoutes';
import type { SignupRequest, SignupResponse, LoginResponse } from '../../types/partner';
import { auth } from '../../config/firebase';

interface AuthState {
  token: string | null;
  user: LoginResponse['user'] | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  token: localStorage.getItem('token'),
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null,
  loading: false,
  error: null,
};

// Signup Thunk
export const signup = createAsyncThunk(
  'auth/signup',
  async (data: SignupRequest & { token: string }, { rejectWithValue }) => {
    try {
      const response = await api.post<SignupResponse>(API_ROUTES.AUTH.SIGNUP, {
        Name: data.fullName,
        phoneNumber: data.phoneNumber
      });
      return { ...response, token: data.token };
    } catch (error: any) {
      console.error('Singup failed:', error);
      return rejectWithValue(error.response?.data?.error || 'Signup failed');
    }
  }
);

// Login Thunk
export const login = createAsyncThunk(
  'auth/login',
  async ({ phoneNumber, token }: { phoneNumber: string, token: string }, { rejectWithValue }) => {
    try {
      const response: any = await api.post<LoginResponse>(API_ROUTES.AUTH.LOGIN, {
        phoneNumber,  // Include phonse number in request
        token
      });

      console.log("response", response)

      return { response, token }; // Return response + token
    } catch (error: any) {
      console.error('Login failed:', error);
      return rejectWithValue(error.response?.data?.error || 'Login failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      auth.signOut().catch((err) => {
        console.error("Firebase sign-out error:", err);
      });

    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(signup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action: any) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        console.log("action", action)
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.response.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setToken, logout } = authSlice.actions;
export default authSlice.reducer;
