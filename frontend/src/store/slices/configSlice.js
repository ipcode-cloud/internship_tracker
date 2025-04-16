import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import axiosInstance from '../../api/axios';

// Async thunk for fetching config
export const fetchConfig = createAsyncThunk(
  'config/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/config');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch config');
    }
  }
);

// Async thunk for updating config
export const updateConfig = createAsyncThunk(
  'config/update',
  async (configData, { rejectWithValue }) => {
    try {
      const configId = configData._id || configData.id;
      if (!configId) {
        throw new Error('Config ID is required for update');
      }
      const response = await axiosInstance.put(`/config/${configId}`, configData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update config');
    }
  }
);

// Async thunk for adding a position to a department
export const addPosition = createAsyncThunk(
  'config/addPosition',
  async ({ department, position }, { getState, rejectWithValue }) => {
    try {
      const { config } = getState().config;
      if (!config) {
        throw new Error('Config not loaded');
      }
      
      const configId = config._id || config.id;
      if (!configId) {
        throw new Error('Config ID is required for update');
      }
      
      // Create a copy of the current positions
      const updatedPositions = { ...config.positions };
      
      // Add the new position to the department
      if (!updatedPositions[department]) {
        updatedPositions[department] = [];
      }
      
      // Check if position already exists
      if (updatedPositions[department].includes(position)) {
        throw new Error('Position already exists in this department');
      }
      
      updatedPositions[department] = [...updatedPositions[department], position];
      
      // Update the config with the new positions
      const response = await axiosInstance.put(`/config/${configId}`, {
        ...config,
        positions: updatedPositions
      });
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to add position');
    }
  }
);

// Async thunk for deleting a position from a department
export const deletePosition = createAsyncThunk(
  'config/deletePosition',
  async ({ department, position }, { getState, rejectWithValue }) => {
    try {
      const { config } = getState().config;
      if (!config) {
        throw new Error('Config not loaded');
      }
      
      const configId = config._id || config.id;
      if (!configId) {
        throw new Error('Config ID is required for update');
      }
      
      // Create a copy of the current positions
      const updatedPositions = { ...config.positions };
      
      // Check if department exists
      if (!updatedPositions[department]) {
        throw new Error('Department does not exist');
      }
      
      // Remove the position from the department
      updatedPositions[department] = updatedPositions[department].filter(p => p !== position);
      
      // Update the config with the new positions
      const response = await axiosInstance.put(`/config/${configId}`, {
        ...config,
        positions: updatedPositions
      });
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to delete position');
    }
  }
);

const configSlice = createSlice({
  name: 'config',
  initialState: {
    config: null,
    loading: false,
    error: null
  },
  reducers: {
    clearConfig: (state) => {
      state.config = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // config fetch
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
        state.error = action.payload;
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
        state.error = action.payload;
      })
      // Add position
      .addCase(addPosition.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addPosition.fulfilled, (state, action) => {
        state.loading = false;
        state.config = action.payload;
      })
      .addCase(addPosition.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete position
      .addCase(deletePosition.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePosition.fulfilled, (state, action) => {
        state.loading = false;
        state.config = action.payload;
      })
      .addCase(deletePosition.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearConfig } = configSlice.actions;
export default configSlice.reducer; 