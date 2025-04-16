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
import Layout from './components/Layout';
import { getCurrentUser } from './store/slices/authSlice';
import InternEdit from './pages/InternEdit';
import Mentors from './pages/Mentors';
import PrivateRoute from './components/auth/PrivateRoute';
import InternProfile from './components/profile/InternProfile';
import axiosInstance from './api/axios';
import Loader from './components/common/Loader';

const App = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, loading, user } = useSelector((state) => state.auth);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Set the token in axios headers
      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Fetch current user
      dispatch(getCurrentUser());
    }
  }, [dispatch]);

  if (loading) {
    return <Loader />
  }

  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        {/* Public routes */}
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to={'/dashboard'} replace /> : <LoginForm />
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? <Navigate to={'/dashboard'} replace /> : <RegisterForm />
          }
        />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            !isAuthenticated ? (
              <Navigate to="/login" replace />
            ) : (
              <Layout />
            )
          }
        >
          <Route
            path="dashboard"
            element={
              <Dashboard />
            }
          />
          <Route path="interns" element={<Interns />} />
          <Route
            path="mentors"
            element={
              <PrivateRoute allowedRoles={['admin']}>
                <Mentors />
              </PrivateRoute>
            }
          />

          {/* Intern profile routes */}
          <Route
            path="interns/:id"
            element={
              <PrivateRoute allowedRoles={['admin', 'mentor', 'intern']}>
                <InternProfile />
              </PrivateRoute>
            }
          />
          <Route
            path="interns/:id/progress"
            element={
              <PrivateRoute allowedRoles={['admin', 'mentor']}>
                <InternEdit />
              </PrivateRoute>
            }
          />
          <Route
            path="interns/:id/attendance"
            element={
              <PrivateRoute allowedRoles={['admin', 'mentor']}>
                <Attendance />
              </PrivateRoute>
            }
          />

          <Route path="attendance" element={<Attendance />} />
          <Route path="settings" element={
            user?.role === 'admin' ? <Settings /> : <Navigate to="/dashboard" replace />
          } />
          <Route path="/profile" element={<Profile />} />
          <Route index element={<Navigate to={user?.role === 'intern' ? '/intern-dashboard' : '/dashboard'} replace />} />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to={user?.role === 'intern' ? '/intern-dashboard' : '/dashboard'} replace />} />
      </Routes>
    </Router>
  );
};

export default App;