import { configureStore } from '@reduxjs/toolkit';
import internReducer from './slices/internSlice';
import attendanceReducer from './slices/attendanceSlice';
import configReducer from './slices/configSlice';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    interns: internReducer,
    attendance: attendanceReducer,
    config: configReducer,
    auth: authReducer,
  },
});

export default store; 