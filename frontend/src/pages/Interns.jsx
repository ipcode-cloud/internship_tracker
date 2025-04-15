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
import InternForm from '../components/interns/InternForm';
import InternList from '../components/interns/InternList';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Interns = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { interns, loading, error } = useSelector((state) => state.interns);
  const { config, loading: configLoading } = useSelector((state) => state.config);
  const { mentors, loading: mentorsLoading } = useSelector((state) => state.auth);
  const [showForm, setShowForm] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [showLoading, setShowLoading] = useState(true);


  useEffect(() => {
    const fetchData = async () => {
      try {
        // Always fetch public config first
        await dispatch(fetchConfig());
        
        // Fetch interns and mentors
        await Promise.all([
          dispatch(fetchInterns()),
          dispatch(fetchMentors())
        ]);
        
        // If admin, also fetch full config
        if (user?.role === 'admin') {
          await dispatch(fetchConfig());
        }
      } catch (error) {
        toast.error(error.message || 'Failed to fetch data');
      } finally {
        // Add a minimum delay of 1 second before hiding the loading state
        setTimeout(() => {
          setShowLoading(false);
        }, 1000);
      }
    };

    fetchData();
  }, [dispatch, user?.role]);

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

  if (showLoading || loading || configLoading || mentorsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading interns..." />
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

      <InternList
        interns={interns}
        searchTerm={searchTerm}
        filterStatus={filterStatus}
        filterDepartment={filterDepartment}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
      />
    </div>
  );
};

export default Interns; 