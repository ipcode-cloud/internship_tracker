import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
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

// Protected Route wrapper component
const ProtectedInternRoute = ({ element: Element, allowedRoles }) => {
  const { user } = useSelector((state) => state.auth);
  const { interns } = useSelector((state) => state.interns);
  const { id } = useParams();

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Admin can access everything
  if (user.role === 'admin') {
    return Element;
  }

  // For mentor and intern roles, we need to check specific permissions
  const intern = interns?.find(i => i._id === id);
  
  if (!intern) {
    // If we can't find the intern, render the element anyway and let the
    // component handle the "not found" state
    return Element;
  }

  if (user.role === 'mentor') {
    // Mentor can access if they are the assigned mentor
    if (intern.mentor === user._id || intern.mentor?._id === user._id) {
      return Element;
    }
  }

  if (user.role === 'intern') {
    // Intern can only access their own profile
    if (intern._id === user._id) {
      return Element;
    }
  }

  // If none of the conditions are met, redirect to dashboard
  return <Navigate to="/dashboard" replace />;
};

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
          path="/"
          element={
            !isAuthenticated ? (
              <Navigate to="/login" replace />
            ) : (
              <Layout />
            )
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="interns" element={<Interns />} />
          
          {/* Intern profile routes */}
          <Route 
            path="intern/:id/profile" 
            element={
              <ProtectedInternRoute 
                element={<Profile />} 
                allowedRoles={['admin', 'mentor', 'intern']} 
              />
            }
          />
          <Route 
            path="intern/:id/edit" 
            element={
              <ProtectedInternRoute 
                element={<InternEdit />} 
                allowedRoles={['admin', 'mentor']} 
              />
            }
          />
          <Route 
            path="intern/:id/attendance" 
            element={
              <ProtectedInternRoute 
                element={<Attendance />} 
                allowedRoles={['admin', 'mentor']} 
              />
            }
          />
          
          <Route path="attendance" element={<Attendance />} />
          <Route path="settings" element={
            user?.role === 'admin' ? <Settings /> : <Navigate to="/dashboard" replace />
          } />
          <Route path="profile" element={<Profile />} />
          <Route index element={<Navigate to="/dashboard" replace />} />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
};

export default App;