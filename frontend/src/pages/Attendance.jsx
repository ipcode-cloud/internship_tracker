import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAttendance,
  createAttendance,
  deleteAttendance,
} from '../store/slices/attendanceSlice';
import { fetchInterns } from '../store/slices/internSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';

const WeeklyOverview = ({ attendance, accessibleInterns }) => {
  // Get the date range for the current week (Monday to Sunday)
  const getWeekRange = () => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday, etc.
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    monday.setHours(0, 0, 0, 0);
    
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    
    return { monday, sunday };
  };

  // Get weekly stats
  const getWeeklyStats = () => {
    const { monday, sunday } = getWeekRange();
    const weeklyRecords = attendance.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= monday && recordDate <= sunday;
    });

    const stats = {
      total: weeklyRecords.length,
      present: weeklyRecords.filter(r => r.status === 'present').length,
      absent: weeklyRecords.filter(r => r.status === 'absent').length,
      late: weeklyRecords.filter(r => r.status === 'late').length,
      attendance_rate: 0
    };

    if (stats.total > 0) {
      stats.attendance_rate = ((stats.present + stats.late) / stats.total * 100).toFixed(1);
    }

    return stats;
  };

  // Get daily breakdown
  const getDailyBreakdown = () => {
    const { monday } = getWeekRange();
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    return days.map((day, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      
      const dayRecords = attendance.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate.toDateString() === date.toDateString();
      });

      return {
        day,
        date: date.toLocaleDateString(),
        present: dayRecords.filter(r => r.status === 'present').length,
        absent: dayRecords.filter(r => r.status === 'absent').length,
        late: dayRecords.filter(r => r.status === 'late').length
      };
    });
  };

  const weeklyStats = getWeeklyStats();
  const dailyBreakdown = getDailyBreakdown();

  return (
    <div className="mb-6 bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4">Weekly Attendance Overview</h3>
      
      {/* Weekly Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-indigo-50 p-4 rounded-lg">
          <p className="text-sm text-indigo-600 mb-1">Total Records</p>
          <p className="text-2xl font-semibold text-indigo-900">{weeklyStats.total}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-green-600 mb-1">Present</p>
          <p className="text-2xl font-semibold text-green-900">{weeklyStats.present}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-sm text-red-600 mb-1">Absent</p>
          <p className="text-2xl font-semibold text-red-900">{weeklyStats.absent}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <p className="text-sm text-yellow-600 mb-1">Late</p>
          <p className="text-2xl font-semibold text-yellow-900">{weeklyStats.late}</p>
        </div>
      </div>

      {/* Daily Breakdown */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Day</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Present</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Absent</th>
              <th className="px-4 py-2 text-center text-xs font-medium text-gray-500">Late</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {dailyBreakdown.map((day) => (
              <tr key={day.day}>
                <td className="px-4 py-2 whitespace-nowrap text-sm">{day.day}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm">{day.date}</td>
                <td className="px-4 py-2 text-center">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {day.present}
                  </span>
                </td>
                <td className="px-4 py-2 text-center">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                    {day.absent}
                  </span>
                </td>
                <td className="px-4 py-2 text-center">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    {day.late}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

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
    setFormData((prev) => ({ 
      ...prev, 
      [name]: value,
      // Clear checkIn/checkOut when status is changed to absent
      ...(name === 'status' && value === 'absent' && {
        checkIn: '',
        checkOut: ''
      })
    }));
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
          placeholder={formData.status === 'absent' ? "Please provide reason for absence (optional)" : "Add any notes (optional)"}
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
  const { user } = useSelector((state) => state.auth);
  const [showForm, setShowForm] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const [filterIntern, setFilterIntern] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchName, setSearchName] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showLoading, setShowLoading] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        dispatch(fetchAttendance()),
        dispatch(fetchInterns())
      ]);
    } finally {
      // Add a minimum delay of 1 second before hiding the loading state
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1000);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setShowLoading(true);
      try {
        await Promise.all([
          dispatch(fetchAttendance()),
          dispatch(fetchInterns())
        ]);
      } finally {
        // Add a minimum delay of 1 second before hiding the loading state
        setTimeout(() => {
          setShowLoading(false);
        }, 1000);
      }
    };

    loadData();
  }, [dispatch]);

  // Filter interns based on user role
  const accessibleInterns = interns.filter(intern => {
    if (user.role === 'admin') return true;
    if (user.role === 'mentor') {
      const mentorId = intern.mentor?._id || intern.mentor;
      return mentorId === user._id;
    }
    if (user.role === 'intern') return intern._id === user._id;
    return false;
  });

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
        notes: formData.notes || ''
      };

      // Only include checkIn/checkOut if status is not 'absent'
      if (formData.status !== 'absent') {
        transformedData.checkIn = formData.checkIn ? 
          createLocalDate(formData.date, formData.checkIn).toISOString() : null;
        transformedData.checkOut = formData.checkOut ? 
          createLocalDate(formData.date, formData.checkOut).toISOString() : null;
      }

      // Log the data being sent to the backend
      console.log('Submitting attendance data:', transformedData);

      await dispatch(createAttendance(transformedData));
      setShowForm(false);
      dispatch(fetchAttendance()); // Refresh the attendance list
    } catch (error) {
      console.error('Error marking attendance:', error);
      // Show error message to user
      alert('Failed to mark attendance. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    const record = attendance.find(a => a._id === id);
    const internId = typeof record.intern === 'object' ? record.intern._id : record.intern;
    const canDelete = user.role === 'admin' || 
      (user.role === 'mentor' && accessibleInterns.some(i => i._id === internId));

    if (!canDelete) {
      alert('You do not have permission to delete this record.');
      return;
    }

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
    const intern = interns.find((i) => i._id === (internId?._id || internId));
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
    // First filter by user role and access
    const internId = typeof record.intern === 'object' ? record.intern._id : record.intern;
    const hasAccess = user.role === 'admin' || 
      (user.role === 'mentor' && accessibleInterns.some(i => i._id === internId)) ||
      (user.role === 'intern' && internId === user._id);
    
    if (!hasAccess) return false;

    // Then apply other filters
    const recordDateFormatted = formatDateToYYYYMMDD(record.date);
    const matchesDate = !filterDate || recordDateFormatted === filterDate;
    
    const internName = getInternName(record.intern).toLowerCase();
    const matchesSearch = !searchName || internName.includes(searchName.toLowerCase());
    
    const recordInternId = typeof record.intern === 'object' ? record.intern._id : record.intern;
    const matchesIntern = !filterIntern || recordInternId === filterIntern;
    
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

  if (showLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading attendance records..." />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {user.role === 'intern' ? 'My Attendance' : 'Attendance Management'}
        </h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex items-center space-x-2 disabled:opacity-50"
          >
            {isRefreshing ? (
              <LoadingSpinner size="sm" text="Refreshing..." />
            ) : (
              <>
                <svg className="h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh</span>
              </>
            )}
          </button>
          {(user.role === 'admin' || user.role === 'mentor') && (
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          Mark Attendance
        </button>
          )}
        </div>
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

      <WeeklyOverview attendance={filteredAttendance} accessibleInterns={accessibleInterns} />

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
          
          {(user.role === 'admin' || user.role === 'mentor') && (
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
          )}

          {(user.role === 'admin' || user.role === 'mentor') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Intern</label>
        <select
          value={filterIntern}
          onChange={(e) => setFilterIntern(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="">All Interns</option>
                {accessibleInterns.map((intern) => (
            <option key={intern._id} value={intern._id}>
              {`${intern.firstName} ${intern.lastName}`}
            </option>
          ))}
        </select>
            </div>
          )}
          
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