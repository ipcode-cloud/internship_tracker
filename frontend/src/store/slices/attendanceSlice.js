import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../api/axios';
import { toast } from 'react-toastify';

// Async thunks
export const fetchAttendance = createAsyncThunk(
  'attendance/fetchAttendance',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState();
      const endpoint = auth.user?.role === 'intern' ? '/attendance/my-attendance' : '/attendance';
      
      console.log('Fetching attendance:', {
        endpoint,
        userRole: auth.user?.role,
        userId: auth.user?._id,
        baseURL: axiosInstance.defaults.baseURL
      });
      
      const response = await axiosInstance.get(endpoint);
      console.log('Raw response:', response);
      console.log('Attendance data:', response.data);
      
      if (!response.data) {
        console.warn('No data in response');
        return [];
      }
      
      const attendanceData = Array.isArray(response.data) ? response.data : [];
      console.log('Processed attendance data:', attendanceData);
      
      return attendanceData;
    } catch (error) {
      console.error('Error fetching attendance:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch attendance' });
    }
  }
);

export const createAttendance = createAsyncThunk(
  'attendance/createAttendance',
  async (attendanceData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/attendance', attendanceData);
      toast.success('Attendance marked successfully');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message;
      if (errorMessage.includes('already marked')) {
        toast.error('Attendance already marked for this date');
      } else {
        toast.error(errorMessage || 'Failed to mark attendance');
      }
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateAttendance = createAsyncThunk(
  'attendance/updateAttendance',
  async ({ id, attendanceData }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/attendance/${id}`, attendanceData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to update attendance record' });
    }
  }
);

export const deleteAttendance = createAsyncThunk(
  'attendance/deleteAttendance',
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/attendance/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to delete attendance record' });
    }
  }
);

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState: {
    attendance: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch attendance
      .addCase(fetchAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.attendance = action.payload;
      })
      .addCase(fetchAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch attendance';
      })
      // Create attendance
      .addCase(createAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.attendance.push(action.payload);
      })
      .addCase(createAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create attendance record';
      })
      // Update attendance
      .addCase(updateAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAttendance.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.attendance.findIndex((record) => record._id === action.payload._id);
        if (index !== -1) {
          state.attendance[index] = action.payload;
        }
      })
      .addCase(updateAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update attendance record';
      })
      // Delete attendance
      .addCase(deleteAttendance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.attendance = state.attendance.filter((record) => record._id !== action.payload);
      })
      .addCase(deleteAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete attendance record';
      });
  },
});

export default attendanceSlice.reducer; 