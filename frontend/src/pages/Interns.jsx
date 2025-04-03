import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchInterns,
  createIntern,
  updateIntern,
  deleteIntern,
} from '../store/slices/internSlice';
import { fetchConfig } from '../store/slices/configSlice';
import { toast } from 'react-toastify';
import { fetchMentors } from '../store/slices/authSlice';

const InternForm = ({ intern, onSubmit, onCancel }) => {
  const dispatch = useDispatch();
  const { departments, positions } = useSelector((state) => state.config.config);
  const { mentors } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
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

  // Update form data when intern changes
  useEffect(() => {
    if (intern) {
      setFormData({
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
    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {intern ? 'Edit Intern' : 'Add New Intern'}
        </h2>
        <button onClick={onCancel} className="text-gray-400 hover:text-gray-500">
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Department</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="">Select Department</option>
                {departments?.map((dept) => (
                  <option key={dept} value={dept}>
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="">Select Position</option>
                {positions?.map((pos) => (
                  <option key={pos} value={pos}>
                    {pos}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Mentor</label>
              <select
                name="mentor"
                value={formData.mentor}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              >
                <option value="">Select Mentor</option>
                {mentors?.map((mentor) => (
                  <option key={mentor._id} value={mentor._id}>
                    {mentor.firstName} {mentor.lastName} - {mentor.department}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Start Date</label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="completed">Completed</option>
            <option value="terminated">Terminated</option>
            <option value="extended">Extended</option>
            <option value="on_leave">On Leave</option>
          </select>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            {intern ? 'Update' : 'Add'} Intern
          </button>
        </div>
      </form>
    </div>
  );
};

const Interns = () => {
  const dispatch = useDispatch();
  const { interns, loading: internsLoading, error: internsError } = useSelector((state) => state.interns);
  const { config, loading: configLoading, error: configError } = useSelector((state) => state.config);
  const { mentors, loading: mentorsLoading, error: mentorsError } = useSelector((state) => state.auth);
  const [showForm, setShowForm] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [dataFetched, setDataFetched] = useState(false);

  // Single useEffect for data fetching with a check to prevent duplicate fetches
  useEffect(() => {
    const fetchData = async () => {
      // Only fetch if data hasn't been fetched yet
      if (!dataFetched) {
        try {
          await Promise.all([
            dispatch(fetchInterns()),
            dispatch(fetchConfig()),
            dispatch(fetchMentors())
          ]);
          setDataFetched(true);
          setIsInitialLoad(false);
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
    };
    
    fetchData();
  }, [dispatch, dataFetched]);

  const handleSubmit = async (formData) => {
    try {
      // Ensure all required fields are present
      if (!formData.firstName || !formData.lastName || !formData.email || 
          !formData.phone || !formData.department || !formData.position || 
          !formData.startDate || !formData.endDate || !formData.mentor) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (selectedIntern) {
        await dispatch(updateIntern({ id: selectedIntern._id, internData: formData })).unwrap();
        toast.success('Intern updated successfully');
      } else {
        await dispatch(createIntern(formData)).unwrap();
        toast.success('Intern added successfully');
      }
      setShowForm(false);
      setSelectedIntern(null);
    } catch (error) {
      toast.error(error.message || 'Failed to save intern');
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
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'terminated':
        return 'bg-red-100 text-red-800';
      case 'extended':
        return 'bg-yellow-100 text-yellow-800';
      case 'on_leave':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredInterns = interns.filter(intern => {
    const matchesSearch = 
      intern.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      intern.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      intern.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = !filterDepartment || intern.department === filterDepartment;
    const matchesStatus = !filterStatus || intern.status === filterStatus;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Show loading state only during initial load
  if (isInitialLoad && (internsLoading || configLoading || mentorsLoading)) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Show error state if any of the data fetching failed
  if (internsError || configError || mentorsError) {
    return (
      <div className="text-center text-red-500 p-4">
        Error: {internsError?.message || configError?.message || mentorsError?.message || 'Failed to load data'}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Interns</h1>
        <button
          onClick={() => {
            setSelectedIntern(null);
            setShowForm(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add New Intern
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search interns..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-4 py-2 border rounded-md"
        />
        <select
          value={filterDepartment}
          onChange={(e) => setFilterDepartment(e.target.value)}
          className="px-4 py-2 border rounded-md"
        >
          <option value="">All Departments</option>
          {config?.departments?.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border rounded-md"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="completed">Completed</option>
          <option value="terminated">Terminated</option>
          <option value="extended">Extended</option>
          <option value="on_leave">On Leave</option>
        </select>
      </div>

      {/* Interns Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Position
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mentor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredInterns.map((intern) => (
              <tr key={intern._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {intern.firstName} {intern.lastName}
                  </div>
                  <div className="text-sm text-gray-500">{intern.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{intern.department}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{intern.position}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {intern.mentor?.firstName} {intern.mentor?.lastName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(intern.status)}`}>
                    {intern.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(intern)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
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
            ))}
          </tbody>
        </table>
        {filteredInterns.length === 0 && (
          <div className="text-center py-4 text-gray-500">
            No interns found
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
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
    </div>
  );
};

export default Interns; 