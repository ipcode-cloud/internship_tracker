import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  fetchAttendance,
  createAttendance,
  deleteAttendance,
  updateAttendance,
} from '../store/slices/attendanceSlice';
import { fetchInterns } from '../store/slices/internSlice';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AttendanceList from '../components/attendance/AttendanceList';
import AttendanceFilter from '../components/attendance/AttendanceFilter';
import AttendanceForm from '../components/attendance/AttendanceForm';
import AttendanceStats from '../components/attendance/AttendanceStats';
import Modal from '../components/common/Modal';

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
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const breakdown = [];

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(monday);
      currentDate.setDate(monday.getDate() + i);
      
      const dayRecords = attendance.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate.toDateString() === currentDate.toDateString();
      });

      breakdown.push({
        day: days[i],
        date: currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        present: dayRecords.filter(r => r.status === 'present').length,
        absent: dayRecords.filter(r => r.status === 'absent').length,
        late: dayRecords.filter(r => r.status === 'late').length
      });
    }

    return breakdown;
  };

  const stats = getWeeklyStats();
  const dailyBreakdown = getDailyBreakdown();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">Weekly Attendance Overview</h2>
      
      {/* Weekly Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-600">Total Records</h3>
          <p className="text-2xl font-semibold text-blue-700 mt-1">{stats.total}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-green-600">Present</h3>
          <p className="text-2xl font-semibold text-green-700 mt-1">{stats.present}</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-yellow-600">Late</h3>
          <p className="text-2xl font-semibold text-yellow-700 mt-1">{stats.late}</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-red-600">Absent</h3>
          <p className="text-2xl font-semibold text-red-700 mt-1">{stats.absent}</p>
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

const Attendance = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { interns, loading: internsLoading } = useSelector((state) => state.interns);
  const { attendance, loading: attendanceLoading } = useSelector((state) => state.attendance);
  
  const [showForm, setShowForm] = useState(false);
  const [showLoading, setShowLoading] = useState(true);
  const [loadingStartTime, setLoadingStartTime] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const [filterIntern, setFilterIntern] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [searchName, setSearchName] = useState('');
  const [editingAttendance, setEditingAttendance] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [attendanceToDelete, setAttendanceToDelete] = useState(null);

  useEffect(() => {
    setLoadingStartTime(Date.now());
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setShowLoading(true);
      try {
        await Promise.all([
          dispatch(fetchAttendance()),
          dispatch(fetchInterns())
        ]);
      } catch (error) {
        console.error('Error loading attendance data:', error);
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
  const accessibleInterns = user?.role === 'admin' 
    ? interns 
    : interns.filter(intern => intern.mentor === user?._id);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        dispatch(fetchAttendance()),
        dispatch(fetchInterns())
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAddAttendance = () => {
    setEditingAttendance(null);
    setShowForm(true);
  };

  const handleEditAttendance = (attendance) => {
    // Format the attendance data for editing
    const formattedAttendance = {
      ...attendance,
      intern: typeof attendance.intern === 'object' ? attendance.intern._id : attendance.intern,
      date: new Date(attendance.date).toISOString().split('T')[0],
      status: attendance.status || 'present',
      checkIn: attendance.checkIn ? new Date(attendance.checkIn).toLocaleTimeString('en-US', { hour12: false }).slice(0, 5) : '',
      checkOut: attendance.checkOut ? new Date(attendance.checkOut).toLocaleTimeString('en-US', { hour12: false }).slice(0, 5) : '',
      notes: attendance.notes || ''
    };
    setEditingAttendance(formattedAttendance);
    setShowForm(true);
  };

  const handleDeleteClick = (attendance) => {
    setAttendanceToDelete(attendance);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await dispatch(deleteAttendance(attendanceToDelete._id)).unwrap();
      toast.success('Attendance record deleted successfully');
      setShowDeleteConfirm(false);
      setAttendanceToDelete(null);
    } catch (error) {
      toast.error(error.message || 'Failed to delete attendance record');
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      // Format the data for submission
      const formattedData = {
        ...formData,
        date: new Date(formData.date),
        status: formData.status,
        intern: formData.intern,
        notes: formData.notes || ''
      };

      // Handle check-in and check-out times based on status
      if (formData.status === 'absent') {
        delete formattedData.checkIn;
        delete formattedData.checkOut;
      } else {
        if (formData.checkIn && formData.checkOut) {
          formattedData.checkIn = new Date(`${formData.date}T${formData.checkIn}`);
          formattedData.checkOut = new Date(`${formData.date}T${formData.checkOut}`);
        }
      }

      if (editingAttendance) {
        // Handle update
        await dispatch(updateAttendance({ 
          id: editingAttendance._id, 
          data: formattedData 
        })).unwrap();
        toast.success('Attendance record updated successfully');
      } else {
        // Handle create
        await dispatch(createAttendance(formattedData)).unwrap();
        toast.success('Attendance marked successfully');
      }
      setShowForm(false);
      setEditingAttendance(null);
    } catch (error) {
      toast.error(error.message || 'Failed to save attendance record');
    }
  };

  const getInternName = (intern) => {
    if (typeof intern === 'object') {
      return `${intern.firstName} ${intern.lastName}`;
    }
    const foundIntern = interns.find(i => i._id === intern);
    return foundIntern ? `${foundIntern.firstName} ${foundIntern.lastName}` : 'Unknown Intern';
  };

  const formatTime = (timeString) => {
    if (!timeString) return '-';
    return new Date(timeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const filteredAttendance = attendance.filter((record) => {
    // First filter by user role and access
    const internId = typeof record.intern === 'object' ? record.intern._id : record.intern;
    const hasAccess = user.role === 'admin' || 
      (user.role === 'mentor' && accessibleInterns.some(i => i._id === internId)) ||
      (user.role === 'intern' && internId === user._id);
    
    if (!hasAccess) return false;

    // Then apply other filters
    const recordDateFormatted = new Date(record.date).toISOString().split('T')[0];
    const matchesDate = !filterDate || recordDateFormatted === filterDate;
    
    const internName = getInternName(record.intern).toLowerCase();
    const matchesSearch = !searchName || internName.includes(searchName.toLowerCase());
    
    const recordInternId = typeof record.intern === 'object' ? record.intern._id : record.intern;
    const matchesIntern = !filterIntern || recordInternId === filterIntern;
    
    const matchesStatus = !filterStatus || record.status === filterStatus;
    
    return matchesDate && matchesIntern && matchesStatus && matchesSearch;
  });

  const clearFilters = () => {
    setFilterDate('');
    setFilterIntern('');
    setFilterStatus('');
    setSearchName('');
  };

  if (showLoading || attendanceLoading || internsLoading) {
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
          onClick={handleAddAttendance}
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
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setShowForm(false);
              setEditingAttendance(null);
            }}
            accessibleInterns={accessibleInterns}
            initialData={editingAttendance}
          />
        </div>
      )}

      <AttendanceStats attendance={filteredAttendance} accessibleInterns={accessibleInterns} />

      <AttendanceFilter
        filterDate={filterDate}
        setFilterDate={setFilterDate}
        filterIntern={filterIntern}
        setFilterIntern={setFilterIntern}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        searchName={searchName}
        setSearchName={setSearchName}
        accessibleInterns={accessibleInterns}
        user={user}
        clearFilters={clearFilters}
      />

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Attendance Records</h2>
        <AttendanceList
          attendance={filteredAttendance}
          accessibleInterns={accessibleInterns}
          getInternName={getInternName}
          formatTime={formatTime}
          onEdit={handleEditAttendance}
          onDelete={handleDeleteClick}
        />
      </div>

      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setAttendanceToDelete(null);
        }}
        title="Confirm Delete"
      >
        <div className="p-4">
          <p>Are you sure you want to delete this attendance record?</p>
          <div className="mt-4 flex justify-end space-x-3">
            <button
              onClick={() => {
                setShowDeleteConfirm(false);
                setAttendanceToDelete(null);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Attendance; 