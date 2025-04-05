import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axios';

// Default departments and positions
const defaultConfig = {
  companyName: '',
  workingHours: { start: '09:00', end: '17:00' },
  departments: ['IT', 'Software Development', 'Marketing', 'HR'],
  positions: ['Intern', 'Junior Developer', 'Senior Developer']
};

// Fetch only departments and positions (public data)
export const fetchPublicConfig = createAsyncThunk(
  'config/fetchPublicConfig',
  async (_, { rejectWithValue }) => {
    try {
      const [departmentsResponse, positionsResponse] = await Promise.all([
        axiosInstance.get('/config/departments'),
        axiosInstance.get('/config/positions')
      ]);

      return {
        departments: departmentsResponse.data || [],
        positions: positionsResponse.data || []
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch public configuration' });
    }
  }
);

// Fetch full config (admin only)
export const fetchConfig = createAsyncThunk(
  'config/fetchConfig',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/config');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch admin configuration' });
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

const initialState = {
  config: {
    companyName: '',
    workingHours: { start: '', end: '' },
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
      // Fetch public config
      .addCase(fetchPublicConfig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPublicConfig.fulfilled, (state, action) => {
        state.loading = false;
        state.config.departments = action.payload.departments;
        state.config.positions = action.payload.positions;
      })
      .addCase(fetchPublicConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch public configuration';
      })
      // Fetch admin config
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
        state.error = action.payload?.message || 'Failed to fetch admin configuration';
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