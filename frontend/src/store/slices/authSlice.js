import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axios';

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/auth/login', credentials);
      const token = response.data.token;
      localStorage.setItem('token', token);
      // Set the token in axios headers
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
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
      const token = response.data.token;
      localStorage.setItem('token', response.data.token);
      
      // Set the token in the axios instance before making the next request
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      const userResponse = await axiosInstance.get('/auth/me');
      return {
        ...response.data,
        user: userResponse.data
      };
    } catch (error) {
      localStorage.removeItem('token');
      delete axiosInstance.defaults.headers.common['Authorization'];
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
      const token = localStorage.getItem('token');
      if (token) {
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      const response = await axiosInstance.get('/auth/me');
      return response.data;
    } catch (error) {
      localStorage.removeItem('token');
      delete axiosInstance.defaults.headers.common['Authorization'];
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

export const fetchUsers = createAsyncThunk(
  'auth/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/auth/users');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch users' });
    }
  }
);

export const updateUser = createAsyncThunk(
  'auth/updateUser',
  async ({ userId, ...userData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/auth/update/${userId}`, userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update user' });
    }
  }
);

export const deleteUser = createAsyncThunk(
  'auth/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.delete(`/auth/users/${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to delete user' });
    }
  }
);

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  mentors: [],
  mentorsLoading: false,
  mentorsError: null,
  users: [],
  usersLoading: false,
  usersError: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
      state.mentorsError = null;
      state.usersError = null;
    },
    clearMentors: (state) => {
      state.mentors = [];
      state.mentorsError = null;
    },
    clearUsers: (state) => {
      state.users = [];
      state.usersError = null;
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
        state.mentors = [];
        state.mentorsError = null;
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
        state.mentorsLoading = true;
        state.mentorsError = null;
      })
      .addCase(fetchMentors.fulfilled, (state, action) => {
        state.mentorsLoading = false;
        state.mentors = action.payload;
        state.mentorsError = null;
      })
      .addCase(fetchMentors.rejected, (state, action) => {
        state.mentorsLoading = false;
        state.mentorsError = action.payload?.message || 'Failed to fetch mentors';
      })
      // Fetch Users
      .addCase(fetchUsers.pending, (state) => {
        state.usersLoading = true;
        state.usersError = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.users = action.payload;
        state.usersError = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.usersLoading = false;
        state.usersError = action.payload?.message || 'Failed to fetch users';
      })
      // Update User
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        // Update the current user if it's their own profile
        if (state.user?._id === action.payload._id) {
          state.user = action.payload;
        }
        // Update the user in the users list
        state.users = state.users.map(user => 
          user._id === action.payload._id ? action.payload : user
        );
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update user';
      })
      // Delete User
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        // Remove the user from the users list
        state.users = state.users.filter(user => user._id !== action.payload._id);
        // If the deleted user is the current user, log them out
        if (state.user?._id === action.payload._id) {
          state.user = null;
          state.isAuthenticated = false;
        }
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete user';
      });
  }
});

export const { clearError, clearMentors, clearUsers } = authSlice.actions;
export default authSlice.reducer; 