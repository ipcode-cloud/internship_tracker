import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Dashboard from './pages/Dashboard';
import Interns from './pages/Interns';
import Attendance from './pages/Attendance';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/Layout';
import { getCurrentUser } from './store/slices/authSlice';

const App = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, loading, user } = useSelector((state) => state.auth);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(getCurrentUser());
    }
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginForm />
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterForm />
          }
        />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="interns" element={<Interns />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Root redirect */}
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

export default App;