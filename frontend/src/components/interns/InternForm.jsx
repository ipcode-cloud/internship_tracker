import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers } from '../../store/slices/authSlice';
import { fetchInterns } from '../../store/slices/internSlice';

const InternForm = ({ intern, onSubmit, onCancel }) => {
  const dispatch = useDispatch();
  const { config } = useSelector((state) => state.config);
  const { mentors, users } = useSelector((state) => state.auth);
  const { interns } = useSelector((state) => state.interns);
  
  const [formData, setFormData] = useState({
    userId: intern?.userId || '',
    firstName: intern?.firstName || '',
    lastName: intern?.lastName || '',
    email: intern?.email || '',
    phone: intern?.phone || '',
    department: intern?.department || '',
    position: intern?.position || '',
    startDate: intern?.startDate?.split('T')[0] || '',
    endDate: intern?.endDate?.split('T')[0] || '',
    status: intern?.status || 'active',
    mentor: intern?.mentor?._id || ''
  });

  // Fetch users when component mounts
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // Get available users (registered users with role 'intern' who aren't already interns)
  const availableUsers = users?.filter(user => {
    // Only show users with role 'intern'
    if (user.role !== 'intern') return false;
    
    // Check if this user is already an intern by comparing email
    const isAlreadyIntern = interns?.some(intern => intern.email === user.email);
    return !isAlreadyIntern;
  }) || [];

  // Update form data when intern changes
  useEffect(() => {
    if (intern) {
      setFormData({
        userId: intern.userId || '',
        firstName: intern.firstName || '',
        lastName: intern.lastName || '',
        email: intern.email || '',
        phone: intern.phone || '',
        department: intern.department || '',
        position: intern.position || '',
        startDate: intern.startDate?.split('T')[0] || '',
        endDate: intern.endDate?.split('T')[0] || '',
        status: intern.status || 'active',
        mentor: intern.mentor?._id || ''
      });
    } else {
      setFormData({
        userId: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        department: '',
        position: '',
        startDate: '',
        endDate: '',
        status: 'active',
        mentor: ''
      });
    }
  }, [intern]);

  const handleUserSelect = (userId) => {
    const selectedUser = users.find(user => user._id === userId);
    // console.log('Selected User:', selectedUser); // Debug log

    if (selectedUser) {
      setFormData(prev => ({
        ...prev,
        userId: selectedUser._id,
        firstName: selectedUser.firstName,
        lastName: selectedUser.lastName,
        email: selectedUser.email,
        phone: selectedUser.phone || '', // Include phone from user data
        department: selectedUser.department || '', // Use department from user data
        position: '', // Set empty string for position since it's not in the user data
        startDate: new Date().toISOString().split('T')[0],
        status: 'active'
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {intern ? 'Edit Intern' : 'Add New Intern'}
        </h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-500 transition-colors">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* User Selection Section - Only show when creating new intern */}
        {!intern && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Select Registered User</h3>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">User</label>
                <select
                  name="userId"
                  value={formData.userId}
                  onChange={(e) => handleUserSelect(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Select a registered user</option>
                  {availableUsers.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.firstName} {user.lastName} ({user.email})
                    </option>
                  ))}
                </select>
                {availableUsers.length === 0 && (
                  <p className="mt-2 text-sm text-gray-500">
                    No available registered users found. Please register a new user first.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Personal Information Section */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
                disabled={!intern && formData.userId} // Disable if user is selected
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
                disabled={!intern && formData.userId} // Disable if user is selected
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
                disabled={!intern && formData.userId} // Disable if user is selected
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                disabled={!intern && formData.userId} // Disable if user is selected
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Internship Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Department</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              >
                <option value="">Select Department</option>
                {config?.departments?.map((dept, index) => (
                  <option key={index} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Position</label>
              <select
                name="position"
                value={formData.position}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              >
                <option value="">Select Position</option>
                {formData.department && config?.positions?.[formData.department]?.map((pos, index) => (
                  <option key={index} value={pos}>
                    {pos}
                  </option>
                ))}
                {!formData.department && (
                  <option value="" disabled>Please select a department first</option>
                )}
                {formData.department && (!config?.positions?.[formData.department] || config.positions[formData.department].length === 0) && (
                  <option value="" disabled>No positions available for this department</option>
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="terminated">Terminated</option>
                <option value="on_leave">On Leave</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Mentor</label>
              <select
                name="mentor"
                value={formData.mentor}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">Select Mentor</option>
                {mentors?.map((mentor) => (
                  <option key={mentor._id} value={mentor._id}>
                    {mentor.firstName} {mentor.lastName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {intern ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default InternForm; 