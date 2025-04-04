import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axios';

// Async thunks
export const fetchInterns = createAsyncThunk(
  'interns/fetchInterns',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/interns');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch interns' });
    }
  }
);

export const createIntern = createAsyncThunk(
  'interns/createIntern',
  async (internData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/interns', internData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to create intern' });
    }
  }
);

export const updateIntern = createAsyncThunk(
  'interns/updateIntern',
  async ({ id, internData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/interns/${id}`, internData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update intern' });
    }
  }
);

export const deleteIntern = createAsyncThunk(
  'interns/deleteIntern',
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/interns/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to delete intern' });
    }
  }
);

const internSlice = createSlice({
  name: 'interns',
  initialState: {
    interns: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearInternError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch interns
      .addCase(fetchInterns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInterns.fulfilled, (state, action) => {
        state.loading = false;
        state.interns = action.payload;
      })
      .addCase(fetchInterns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch interns';
      })
      // Create intern
      .addCase(createIntern.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createIntern.fulfilled, (state, action) => {
        state.loading = false;
        state.interns.push(action.payload);
      })
      .addCase(createIntern.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create intern';
      })
      // Update intern
      .addCase(updateIntern.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateIntern.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.interns.findIndex((intern) => intern._id === action.payload._id);
        if (index !== -1) {
          state.interns[index] = action.payload;
        }
      })
      .addCase(updateIntern.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update intern';
      })
      // Delete intern
      .addCase(deleteIntern.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteIntern.fulfilled, (state, action) => {
        state.loading = false;
        state.interns = state.interns.filter((intern) => intern._id !== action.payload);
      })
      .addCase(deleteIntern.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete intern';
      });
  },
});

export const { clearInternError } = internSlice.actions;
export default internSlice.reducer; 