import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axios';

// Async thunks
export const fetchConfig = createAsyncThunk(
  'config/fetchConfig',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/config');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch config' });
    }
  }
);

export const updateConfig = createAsyncThunk(
  'config/updateConfig',
  async (configData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put('/config', configData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update config' });
    }
  }
);

const configSlice = createSlice({
  name: 'config',
  initialState: {
    config: {
      companyName: '',
      workingHours: {
        start: '09:00',
        end: '17:00',
      },
      departments: [],
      positions: [],
    },
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch config
      .addCase(fetchConfig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConfig.fulfilled, (state, action) => {
        state.loading = false;
        state.config = action.payload;
      })
      .addCase(fetchConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch config';
      })
      // Update config
      .addCase(updateConfig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateConfig.fulfilled, (state, action) => {
        state.loading = false;
        state.config = action.payload;
      })
      .addCase(updateConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update config';
      });
  },
});

export default configSlice.reducer; 