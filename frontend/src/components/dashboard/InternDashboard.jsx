import React, { useEffect } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';
import { useSelector } from 'react-redux';

const InternDashboard = ({
  user: propUser,
  attendance: propAttendance,
  mentors: propMentors,
  loading: propLoading
}) => {

  // Use props if provided
  // const user = propUser
  const { user, users, loading: usersLoading, isAuthenticated } = useSelector((state) => state.auth);
  const attendance = propAttendance
  const mentors = propMentors
  const loading = propLoading

  // Sort attendance records by date
  const userAttendance = [...attendance]
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // Calculate attendance statistics from first attendance record
  const firstAttendanceDate = userAttendance.length > 0 
    ? new Date(userAttendance[userAttendance.length - 1].date)
    : new Date();
  firstAttendanceDate.setHours(0, 0, 0, 0);
  
  const recentAttendance = userAttendance.filter(record => {
    const recordDate = new Date(record.date);
    recordDate.setHours(0, 0, 0, 0);
    return recordDate >= firstAttendanceDate && recordDate <= new Date();
  });

  // Calculate total working days (excluding weekends) from first attendance
  const totalWorkingDays = Array.from({ length: Math.ceil((new Date() - firstAttendanceDate) / (1000 * 60 * 60 * 24)) + 1 }, (_, i) => {
    const date = new Date(firstAttendanceDate);
    date.setDate(date.getDate() + i);
    date.setHours(0, 0, 0, 0);
    return date.getDay() >= 1 && date.getDay() <= 5 ? 1 : 0;
  }).reduce((sum, day) => sum + day, 0);

  const presentDays = recentAttendance.filter(record => record.status === 'present').length;
  const absentDays = recentAttendance.filter(record => record.status === 'absent').length;
  const lateDays = recentAttendance.filter(record => record.status === 'late').length;
  const attendancePercentage = totalWorkingDays > 0 ? ((presentDays + lateDays) / totalWorkingDays) * 100 : 0;

  // Calculate weekly attendance
  const weeklyAttendance = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    
    const dayAttendance = userAttendance.find(record => 
      new Date(record.date).toISOString().split('T')[0] === dateString
    );

    return {
      date: dateString,
      dayName,
      isWeekend,
      status: isWeekend ? 'weekend' : (dayAttendance?.status || 'absent'),
      checkIn: dayAttendance?.checkIn ? new Date(dayAttendance.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
      checkOut: dayAttendance?.checkOut ? new Date(dayAttendance.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
      markedBy: dayAttendance?.markedBy ? `${dayAttendance.markedBy.firstName} ${dayAttendance.markedBy.lastName}` : '-',
      notes: dayAttendance?.notes || '-'
    };
  }).reverse();

  // Get mentor information
  const mentor = mentors?.find(m => m._id === user?.mentor);
  const mentorName = mentor ? `${mentor.firstName} ${mentor.lastName}` : 'Not assigned';
  const performanceRating = user?.performanceRating || 'Not rated';
  const projectStatus = user?.projectStatus || 'Not assigned';

  const getPerformanceColor = (rating) => {
    switch(rating?.toLowerCase()) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getProjectStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed': return 'text-green-600';
      case 'in progress': return 'text-blue-600';
      case 'pending': return 'text-yellow-600';
      case 'not started': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="text-lg font-medium">{user?.firstName} {user?.lastName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Department</p>
            <p className="text-lg font-medium">{user?.department}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Position</p>
            <p className="text-lg font-medium">{user?.position}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Mentor</p>
            <p className="text-lg font-medium">{mentorName}</p>
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Performance Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Performance Rating</p>
            <p className={`text-lg font-medium ${getPerformanceColor(performanceRating)}`}>
              {performanceRating}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Project Status</p>
            <p className={`text-lg font-medium ${getProjectStatusColor(projectStatus)}`}>
              {projectStatus}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Attendance Score</p>
            <p className="text-lg font-medium">{attendancePercentage.toFixed(1)}%</p>
          </div>
        </div>
      </div>
      
      {/* Attendance Summary */}
        <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Attendance Summary (Last 30 Days)</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">Total Working Days</p>
            <p className="text-lg font-medium">{totalWorkingDays}</p>
              </div>
          <div>
            <p className="text-sm text-gray-500">Present Days</p>
            <p className="text-lg font-medium text-green-600">{presentDays}</p>
              </div>
          <div>
            <p className="text-sm text-gray-500">Absent Days</p>
            <p className="text-lg font-medium text-red-600">{absentDays}</p>
              </div>
          <div>
            <p className="text-sm text-gray-500">Late Days</p>
            <p className="text-lg font-medium text-yellow-600">{lateDays}</p>
            </div>
          </div>
        </div>

      {/* Weekly Attendance */}
        <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Weekly Attendance</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marked By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {weeklyAttendance.map((day, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(day.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      day.isWeekend ? 'bg-gray-100 text-gray-800' :
                      day.status === 'present' ? 'bg-green-100 text-green-800' :
                      day.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {day.isWeekend ? 'Weekend' : day.status.charAt(0).toUpperCase() + day.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{day.checkIn}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{day.checkOut}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{day.markedBy}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{day.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InternDashboard; 