import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateUser, fetchUsers, getCurrentUser } from '../../store/slices/authSlice';
import { fetchConfig } from '../../store/slices/configSlice';
import { toast } from 'react-toastify';

const UserProfile = ({ userId }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user: currentUser, users, usersLoading, isAuthenticated, loading } = useSelector((state) => state.auth);
  const { config } = useSelector((state) => state.config);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    position: ''
  });

  // Fetch current user immediately if not available
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !currentUser && !loading) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, currentUser, loading]);

  // Fetch users and config when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Only fetch users if we don't have them yet
        if (users.length === 0) {
          await dispatch(fetchUsers());
        }
        // Fetch config in parallel if needed
        if (!config) {
          await dispatch(fetchConfig());
        }
      } catch (error) {
        toast.error('Failed to load user data');
      }
    };

    if (isAuthenticated && currentUser) {
      fetchData();
    }
  }, [dispatch, users.length, config, isAuthenticated, currentUser]);

  // Get the user to display (either current user or specified user)
  const displayUser = userId ? users.find(u => u._id === userId) : currentUser;

  useEffect(() => {
    if (displayUser) {
      setFormData({
        firstName: displayUser.firstName || '',
        lastName: displayUser.lastName || '',
        email: displayUser.email || '',
        phone: displayUser.phone || '',
        department: displayUser.department || '',
        position: displayUser.position || ''
      });
    }
  }, [displayUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Check if user is authenticated
      if (!isAuthenticated) {
        toast.error('Please log in to update profile');
        return;
      }

      // Check if we have a valid currentUser with an ID
      if (!currentUser?._id) {
        // Try to fetch current user again
        const result = await dispatch(getCurrentUser()).unwrap();
        if (!result?._id) {
          toast.error('User data not available. Please try logging in again.');
          return;
        }
      }

      // Only allow editing if it's the current user's profile
      if (!userId || userId === currentUser._id) {
        // Use currentUser._id for updates
        const result = await dispatch(updateUser({ 
          userId: currentUser._id, 
          ...formData,
          position: formData.position || null // Ensure position is sent as null if empty
        })).unwrap();
        
        // Refresh users list after update to ensure we have the latest data
        await dispatch(fetchUsers());
        
        toast.success('Profile updated successfully');
        setIsEditing(false);
        
        // Navigate back to the profile page
        navigate('/profile');
      } else {
        toast.error('You can only edit your own profile');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
    }
  };

  // Show loading state if we're still fetching data
  if (loading || usersLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading user data...</p>
      </div>
    );
  }

  // Show error if user is not found
  if (!displayUser) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">User not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {(!userId || userId === currentUser._id) ? 'My Profile' : `${displayUser.firstName}'s Profile`}
          </h2>
          {/* Only show edit button for current user's profile */}
          {(!userId || userId === currentUser._id) && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              ) : (
                <p className="mt-1 text-gray-900">{formData.firstName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              ) : (
                <p className="mt-1 text-gray-900">{formData.lastName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              ) : (
                <p className="mt-1 text-gray-900">{formData.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              ) : (
                <p className="mt-1 text-gray-900">{formData.phone || 'Not provided'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Department</label>
              {isEditing ? (
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Select Department</option>
                  {config?.departments?.map((dept, index) => (
                    <option key={index} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="mt-1 text-gray-900">{formData.department || 'Not assigned'}</p>
              )}
            </div>

            {/* Only show position field if user is not an admin */}
            {displayUser.role !== 'admin' && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Position</label>
                {isEditing ? (
                  <select
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="">Select Position</option>
                    {formData.department && config?.positions?.[formData.department]?.map((pos, index) => (
                      <option key={index} value={pos}>
                        {pos}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="mt-1 text-gray-900">{formData.position || 'Not assigned'}</p>
                )}
              </div>
            )}
          </div>

          {isEditing && (
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Save Changes
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default UserProfile; 