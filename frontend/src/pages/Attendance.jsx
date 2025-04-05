import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAttendance,
  createAttendance,
  deleteAttendance,
} from '../store/slices/attendanceSlice';
import { fetchInterns } from '../store/slices/internSlice';

const AttendanceForm = ({ onSubmit, onCancel }) => {
  const { interns } = useSelector((state) => state.interns);
  
  // Format today's date in local timezone to YYYY-MM-DD for the date input
  const formatLocalDate = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };
  
  const [formData, setFormData] = useState({
    internId: '',
    date: formatLocalDate(),
    status: 'present',
    checkIn: '',
    checkOut: '',
    notes: '',
  });

  // Filter active interns and sort them by name
  const activeInterns = interns
    .filter((intern) => intern.status === 'active')
    .sort((a, b) => {
      const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
      const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
      return nameA.localeCompare(nameB);
    });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Intern</label>
        <select
          name="internId"
          value={formData.internId}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        >
          <option value="">Select Intern</option>
          {activeInterns.map((intern) => (
            <option key={intern._id} value={intern._id}>
              {`${intern.firstName} ${intern.lastName}`}
            </option>
          ))}
        </select>
        {activeInterns.length === 0 && (
          <p className="mt-2 text-sm text-red-600">
            No active interns found. Please add interns first.
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Date</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
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
          <option value="present">Present</option>
          <option value="absent">Absent</option>
          <option value="late">Late</option>
        </select>
      </div>

      {formData.status !== 'absent' && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700">Check In</label>
            <input
              type="time"
              name="checkIn"
              value={formData.checkIn}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required={formData.status !== 'absent'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Check Out</label>
            <input
              type="time"
              name="checkOut"
              value={formData.checkOut}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required={formData.status !== 'absent'}
            />
          </div>
        </>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
        >
          Mark Attendance
        </button>
      </div>
    </form>
  );
};

const Attendance = () => {
  const dispatch = useDispatch();
  const { attendance, loading } = useSelector((state) => state.attendance);
  const { interns } = useSelector((state) => state.interns);
  const [showForm, setShowForm] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const [filterIntern, setFilterIntern] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchName, setSearchName] = useState('');

  useEffect(() => {
    dispatch(fetchAttendance());
    dispatch(fetchInterns());
  }, [dispatch]);

  const handleSubmit = async (formData) => {
    try {
      // Helper function to create a date in the local timezone
      const createLocalDate = (dateString, timeString = null) => {
        // Parse the date components
        const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10));
        
        if (timeString) {
          // If time is provided, include it
          const [hours, minutes] = timeString.split(':').map(num => parseInt(num, 10));
          // Create date with local components (months are 0-indexed in JS Date)
          return new Date(year, month - 1, day, hours, minutes, 0);
        } else {
          // Date only (months are 0-indexed in JS Date)
          return new Date(year, month - 1, day);
        }
      };

      // Create the date object in local timezone
      const attendanceDate = createLocalDate(formData.date);
      
      // Transform the form data to match backend expectations
      const transformedData = {
        intern: formData.internId,
        date: attendanceDate.toISOString(),
        status: formData.status,
        checkIn: formData.status !== 'absent' && formData.checkIn ? 
          createLocalDate(formData.date, formData.checkIn).toISOString() : null,
        checkOut: formData.status !== 'absent' && formData.checkOut ? 
          createLocalDate(formData.date, formData.checkOut).toISOString() : null,
        notes: formData.notes
      };

      await dispatch(createAttendance(transformedData));
      setShowForm(false);
      dispatch(fetchAttendance()); // Refresh the attendance list
    } catch (error) {
      console.error('Error marking attendance:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this attendance record?')) {
      await dispatch(deleteAttendance(id));
    }
  };

  const getInternName = (internId) => {
    // If intern is already populated in the attendance record
    if (typeof internId === 'object' && internId.firstName && internId.lastName) {
      return `${internId.firstName} ${internId.lastName}`;
    }
    // Fallback to finding in interns array
    const intern = interns.find((i) => i._id === internId);
    return intern ? `${intern.firstName} ${intern.lastName}` : 'Unknown';
  };

  // Helper function to format date to YYYY-MM-DD for consistent comparison
  const formatDateToYYYYMMDD = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const filteredAttendance = attendance.filter((record) => {
    // Format record date for consistent comparison
    const recordDateFormatted = formatDateToYYYYMMDD(record.date);
    
    // Compare dates in YYYY-MM-DD format 
    const matchesDate = !filterDate || recordDateFormatted === filterDate;
    
    // Get the intern name for searching
    const internName = getInternName(record.intern).toLowerCase();
    const matchesSearch = !searchName || internName.includes(searchName.toLowerCase());
    
    // Handle both string IDs and object references for interns
    const recordInternId = typeof record.intern === 'object' ? record.intern._id : record.intern;
    const matchesIntern = !filterIntern || recordInternId === filterIntern;
    
    // Status matching is already correct
    const matchesStatus = !filterStatus || record.status === filterStatus;
    
    return matchesDate && matchesIntern && matchesStatus && matchesSearch;
  });

  // Reset all filters
  const clearFilters = () => {
    setFilterDate('');
    setFilterIntern('');
    setFilterStatus('');
    setSearchName('');
  };

  // Format time for display
  const formatTime = (timeString) => {
    if (!timeString) return '-';
    return new Date(timeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Attendance</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          Mark Attendance
        </button>
      </div>

      {showForm && (
        <div className="mb-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Mark Attendance</h2>
          <AttendanceForm
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-3">Filter Attendance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search by Name</label>
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="Enter intern name"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Intern</label>
            <select
              value={filterIntern}
              onChange={(e) => setFilterIntern(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">All Interns</option>
              {interns.map((intern) => (
                <option key={intern._id} value={intern._id}>
                  {`${intern.firstName} ${intern.lastName}`}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">All Status</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="half-day">Half Day</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-end mt-4">
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Clear Filters
          </button>
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Intern</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAttendance.length > 0 ? (
              filteredAttendance.map((record) => (
                <tr key={record._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(record.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getInternName(record.intern)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      record.status === 'present' ? 'bg-green-100 text-green-800' :
                      record.status === 'absent' ? 'bg-red-100 text-red-800' :
                      record.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatTime(record.checkIn)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatTime(record.checkOut)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{record.notes || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleDelete(record._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                  No attendance records found matching your filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Attendance; 