import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axios';

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/login', credentials);
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Login failed' });
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/register', userData);
      // Store token first
      localStorage.setItem('token', response.data.token);
      // Then fetch user data to ensure we have the complete user object
      const userResponse = await axiosInstance.get('/auth/me');
      return {
        ...response.data,
        user: userResponse.data
      };
    } catch (error) {
      localStorage.removeItem('token');
      return rejectWithValue(error.response?.data || { message: 'Registration failed' });
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  localStorage.removeItem('token');
});

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/auth/me');
      return response.data;
    } catch (error) {
      localStorage.removeItem('token');
      return rejectWithValue(error.response?.data || { message: 'Failed to get user data' });
    }
  }
);

export const fetchMentors = createAsyncThunk(
  'auth/fetchMentors',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/auth/mentors');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch mentors' });
    }
  }
);

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  mentors: []
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload?.message || 'Login failed';
      })
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload?.message || 'Registration failed';
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      // Get Current User
      .addCase(getCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.error = action.payload?.message || 'Failed to get user data';
      })
      // Fetch Mentors
      .addCase(fetchMentors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMentors.fulfilled, (state, action) => {
        state.loading = false;
        state.mentors = action.payload;
        state.error = null;
      })
      .addCase(fetchMentors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch mentors';
      });
  }
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer; 