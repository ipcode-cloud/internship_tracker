import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchConfig, updateConfig } from '../store/slices/configSlice';
import { toast } from 'react-toastify';
import { Navigate } from 'react-router-dom';

const Settings = () => {
  const dispatch = useDispatch();
  const { config, loading, error } = useSelector((state) => state.config);
  const { user } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    companyName: '',
    workingHours: {
      start: '',
      end: ''
    },
    departments: [],
    positions: []
  });
  const [newDepartment, setNewDepartment] = useState('');
  const [newPosition, setNewPosition] = useState('');

  // If not admin, redirect to dashboard
  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    const loadConfig = async () => {
      try {
        await dispatch(fetchConfig()).unwrap();
      } catch (err) {
        toast.error(err.message || 'Failed to fetch settings');
      }
    };
    loadConfig();
  }, [dispatch]);

  useEffect(() => {
    if (config) {
      setFormData({
        companyName: config.companyName || '',
        workingHours: {
          start: config.workingHours?.start || '09:00',
          end: config.workingHours?.end || '17:00'
        },
        departments: config.departments || [],
        positions: config.positions || []
      });
    }
  }, [config]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAddDepartment = () => {
    if (newDepartment && !formData.departments.includes(newDepartment)) {
      setFormData(prev => ({
        ...prev,
        departments: [...prev.departments, newDepartment]
      }));
      setNewDepartment('');
    }
  };

  const handleRemoveDepartment = (department) => {
    setFormData(prev => ({
      ...prev,
      departments: prev.departments.filter(d => d !== department)
    }));
  };

  const handleAddPosition = () => {
    if (newPosition && !formData.positions.includes(newPosition)) {
      setFormData(prev => ({
        ...prev,
        positions: [...prev.positions, newPosition]
      }));
      setNewPosition('');
    }
  };

  const handleRemovePosition = (position) => {
    setFormData(prev => ({
      ...prev,
      positions: prev.positions.filter(p => p !== position)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateConfig(formData)).unwrap();
      toast.success('Settings updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update settings');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Company Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Company Name</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Working Hours Start</label>
                <input
                  type="time"
                  name="workingHours.start"
                  value={formData.workingHours.start}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Working Hours End</label>
                <input
                  type="time"
                  name="workingHours.end"
                  value={formData.workingHours.end}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Departments</h2>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
                placeholder="Add new department"
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddDepartment}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.departments.map((department) => (
                <span
                  key={department}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {department}
                  <button
                    type="button"
                    onClick={() => handleRemoveDepartment(department)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Positions</h2>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={newPosition}
                onChange={(e) => setNewPosition(e.target.value)}
                placeholder="Add new position"
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddPosition}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.positions.map((position) => (
                <span
                  key={position}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {position}
                  <button
                    type="button"
                    onClick={() => handleRemovePosition(position)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings; 