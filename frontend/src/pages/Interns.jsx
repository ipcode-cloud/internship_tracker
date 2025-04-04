import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchInterns,
  createIntern,
  updateIntern,
  deleteIntern,
  clearInternError
} from '../store/slices/internSlice';
import { fetchConfig } from '../store/slices/configSlice';
import { toast } from 'react-toastify';
import { fetchMentors, fetchUsers } from '../store/slices/authSlice';

const InternForm = ({ intern, onSubmit, onCancel }) => {
  const dispatch = useDispatch();
  const { departments, positions } = useSelector((state) => state.config.config);
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
    return user.role === 'intern' && !interns?.some(intern => intern.userId === user._id);
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
    console.log('Selected User:', selectedUser); // Debug log
    
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
                {departments?.map((dept, index) => (
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
                {positions?.map((pos, index) => (
                  <option key={index} value={pos}>
                    {pos}
                  </option>
                ))}
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

const Interns = () => {
  const dispatch = useDispatch();
  const { interns, loading: internsLoading, error: internError } = useSelector((state) => state.interns);
  const { config, loading: configLoading } = useSelector((state) => state.config);
  const { mentors, loading: mentorsLoading } = useSelector((state) => state.auth);
  const [showForm, setShowForm] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');

  // Fetch data only once when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!interns.length && !internsLoading) {
          await dispatch(fetchInterns());
        }
        if (!config && !configLoading) {
          await dispatch(fetchConfig());
        }
        if (!mentors?.length && !mentorsLoading) {
          await dispatch(fetchMentors());
        }
      } catch (error) {
        toast.error('Failed to fetch data');
      }
    };

    fetchData();
  }, [dispatch, interns.length, internsLoading, config, configLoading, mentors?.length, mentorsLoading]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearInternError());
    };
  }, [dispatch]);

  const handleSubmit = async (formData) => {
    try {
      if (selectedIntern) {
        await dispatch(updateIntern({ id: selectedIntern._id, internData: formData })).unwrap();
        toast.success('Intern updated successfully');
      } else {
        await dispatch(createIntern(formData)).unwrap();
        toast.success('Intern created successfully');
      }
      setShowForm(false);
      setSelectedIntern(null);
    } catch (error) {
      toast.error(error.message || 'Operation failed');
    }
  };

  const handleEdit = (intern) => {
    setSelectedIntern(intern);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this intern?')) {
      try {
        await dispatch(deleteIntern(id)).unwrap();
        toast.success('Intern deleted successfully');
      } catch (error) {
        toast.error(error.message || 'Failed to delete intern');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'terminated':
        return 'bg-red-100 text-red-800';
      case 'on_leave':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter interns based on search term and filters
  const filteredInterns = interns.filter(intern => {
    const matchesSearch = 
      intern.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      intern.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      intern.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || intern.status === filterStatus;
    const matchesDepartment = filterDepartment === 'all' || intern.department === filterDepartment;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  if (internsLoading || configLoading || mentorsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Interns</h1>
        <button
          onClick={() => {
            setSelectedIntern(null);
            setShowForm(true);
          }}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add New Intern
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <InternForm
            intern={selectedIntern}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false);
              setSelectedIntern(null);
            }}
          />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Search</label>
            <input
              type="text"
              placeholder="Search by name or email"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="terminated">Terminated</option>
              <option value="on_leave">On Leave</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Department</label>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="all">All Departments</option>
              {config?.departments?.map((dept, index) => (
                <option key={index} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {internError && (
        <div className="bg-red-50 p-4 rounded-md">
          <p className="text-red-700">{internError}</p>
        </div>
      )}

      {/* Interns Table */}
      <div className="bg-white shadow overflow-hidden rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mentor
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInterns.length > 0 ? (
                filteredInterns.map((intern) => (
                  <tr key={intern._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {intern.firstName} {intern.lastName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{intern.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{intern.department}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{intern.position}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(intern.status)}`}>
                        {intern.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {intern.mentor ? `${intern.mentor.firstName} ${intern.mentor.lastName}` : 'Not assigned'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(intern)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(intern._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                    No interns found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Interns; 