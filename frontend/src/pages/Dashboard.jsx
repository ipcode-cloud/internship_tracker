import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchInterns } from '../store/slices/internSlice';
import { fetchAttendance } from '../store/slices/attendanceSlice';
import { fetchConfig } from '../store/slices/configSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { interns, loading: internsLoading } = useSelector((state) => state.interns);
  const { attendance, loading: attendanceLoading } = useSelector((state) => state.attendance);
  const { config, loading: configLoading } = useSelector((state) => state.config);

  useEffect(() => {
    dispatch(fetchInterns());
    dispatch(fetchAttendance());
    dispatch(fetchConfig());
  }, [dispatch]);

  if (internsLoading || attendanceLoading || configLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Intern Statistics
  const activeInterns = interns.filter((intern) => intern.status === 'active');
  const completedInterns = interns.filter((intern) => intern.status === 'completed');
  const terminatedInterns = interns.filter((intern) => intern.status === 'terminated');
  const onLeaveInterns = interns.filter((intern) => intern.status === 'on_leave');

  // Department Statistics
  const departmentStats = activeInterns.reduce((acc, intern) => {
    acc[intern.department] = (acc[intern.department] || 0) + 1;
    return acc;
  }, {});

  // Attendance Statistics
  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = attendance.filter((record) => record.date === today);
  const presentToday = todayAttendance.filter((record) => record.status === 'present').length;
  const absentToday = todayAttendance.filter((record) => record.status === 'absent').length;
  const lateToday = todayAttendance.filter((record) => record.status === 'late').length;
  const halfDayToday = todayAttendance.filter((record) => record.status === 'half-day').length;

  // Weekly Attendance
  const getLastWeekDates = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const weeklyAttendance = getLastWeekDates().map(date => {
    const dayAttendance = attendance.filter(record => record.date === date);
    return {
      date,
      present: dayAttendance.filter(record => record.status === 'present').length,
      absent: dayAttendance.filter(record => record.status === 'absent').length,
      late: dayAttendance.filter(record => record.status === 'late').length,
      halfDay: dayAttendance.filter(record => record.status === 'half-day').length,
    };
  });

  const recentAttendance = attendance
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const getInternName = (internId) => {
    const intern = interns.find((i) => i._id === internId);
    return intern ? `${intern.firstName} ${intern.lastName}` : 'Unknown';
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Intern Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Active Interns</h3>
              <p className="text-3xl font-bold text-green-600">{activeInterns.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Completed</h3>
              <p className="text-3xl font-bold text-blue-600">{completedInterns.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Terminated</h3>
              <p className="text-3xl font-bold text-red-600">{terminatedInterns.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">On Leave</h3>
              <p className="text-3xl font-bold text-yellow-600">{onLeaveInterns.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Attendance and Department Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Today's Attendance</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Present</span>
              <span className="font-semibold text-green-600">{presentToday}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Absent</span>
              <span className="font-semibold text-red-600">{absentToday}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Late</span>
              <span className="font-semibold text-yellow-600">{lateToday}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Half Day</span>
              <span className="font-semibold text-blue-600">{halfDayToday}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Department Distribution</h2>
          <div className="space-y-4">
            {Object.entries(departmentStats).map(([department, count]) => (
              <div key={department} className="flex justify-between items-center">
                <span className="text-gray-600">{department}</span>
                <span className="font-semibold text-indigo-600">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly Attendance Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Weekly Attendance</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Present</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Absent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Late</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Half Day</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {weeklyAttendance.map((day) => (
                <tr key={day.date}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(day.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">{day.present}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">{day.absent}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">{day.late}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">{day.halfDay}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Attendance */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Attendance</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Intern</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check In</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check Out</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentAttendance.map((record) => (
                <tr key={record._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(record.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {getInternName(record.intern)}
                  </td>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.checkIn ? new Date(record.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 