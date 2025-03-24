import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/api';
import { API_ROUTES } from '../../constants/apiRoutes';
import type { SignupRequest, SignupResponse, LoginResponse } from '../../types/partner';

interface AuthState {
  token: string | null;
  user: LoginResponse['user'] | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  token: null,
  user: null,
  loading: false,
  error: null,
};

export const signup = createAsyncThunk(
  'auth/signup',
  async (data: SignupRequest) => {
    const response = await api.post<SignupResponse>(API_ROUTES.AUTH.SIGNUP, data);
    return response;
  }
);

// export const login = createAsyncThunk(
//   'auth/login',
//   async (token: any) => {
//     const response = await api.post<LoginResponse>(API_ROUTES.AUTH.LOGIN);
//     return { token, user: response.user };
//   }
// );

export const login = createAsyncThunk(
  'auth/login',
  async (token: string) => {
    const response = await api.post<any>(API_ROUTES.AUTH.LOGIN, { token });
    return { token, user: response.data.user }; // Ensure response includes 'user'
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
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Signup failed';
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Login failed';
      });
  },
});

export const { setToken, logout } = authSlice.actions;
export default authSlice.reducer;