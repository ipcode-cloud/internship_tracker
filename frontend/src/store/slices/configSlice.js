import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axios';

// Async thunks
export const fetchConfig = createAsyncThunk(
  'config/fetchConfig',
  async (_, { rejectWithValue }) => {
    try {
      // Fetch departments and positions separately using public endpoints
      const [departmentsResponse, positionsResponse] = await Promise.all([
        axiosInstance.get('/config/departments'),
        axiosInstance.get('/config/positions')
      ]);

      return {
        departments: departmentsResponse.data,
        positions: positionsResponse.data
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch configuration' });
    }
  }
);

export const updateConfig = createAsyncThunk(
  'config/updateConfig',
  async (configData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put('/config', configData);
      return {
        companyName: response.data.companyName || '',
        workingHours: response.data.workingHours || { start: '09:00', end: '17:00' },
        departments: response.data.departments || [],
        positions: response.data.positions || []
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update config' });
    }
  }
);

const initialState = {
  config: {
    departments: [],
    positions: []
  },
  loading: false,
  error: null
};

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    clearConfigError: (state) => {
      state.error = null;
    }
  },
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
        state.error = action.payload?.message || 'Failed to fetch configuration';
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
  }
});

export const { clearConfigError } = configSlice.actions;
export default configSlice.reducer; 