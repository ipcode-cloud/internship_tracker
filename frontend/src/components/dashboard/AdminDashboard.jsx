import React from 'react';

const AdminDashboard = ({ 
  interns, 
  presentToday, 
  absentToday, 
  lateToday, 
  halfDayToday,
  adminWeeklyAttendance,
  performanceStats,
  projectStats
}) => {
  return (
    <div className="space-y-6">
      {/* Overview Section */}
      <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-lg shadow-lg p-6 text-white">
        <h2 className="text-xl font-semibold mb-2">Admin Dashboard</h2>
        <p className="mb-4">Here's an overview of the internship program.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <h3 className="text-sm font-medium text-indigo-400">Total Interns</h3>
            <p className="text-lg font-semibold mt-1 text-indigo-500">{interns.length}</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <h3 className="text-sm font-medium text-green-400">Active Interns</h3>
            <p className="text-lg font-semibold mt-1 text-green-500">
              {interns.filter(intern => intern.status === 'active').length}
            </p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <h3 className="text-sm font-medium text-yellow-400">Performance</h3>
            <p className="text-lg font-semibold mt-1 text-yellow-500">
              {performanceStats.excellent + performanceStats.good} Good or Better
            </p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <h3 className="text-sm font-medium text-purple-400">Projects</h3>
            <p className="text-lg font-semibold mt-1 text-purple-500">
              {projectStats.completed} Completed
            </p>
          </div>
        </div>
      </div>

      {/* Today's Attendance Overview */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Today's Attendance Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-green-600">Present</h3>
            <p className="text-2xl font-semibold text-green-700 mt-1">{presentToday}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-yellow-600">Late</h3>
            <p className="text-2xl font-semibold text-yellow-700 mt-1">{lateToday}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-red-600">Absent</h3>
            <p className="text-2xl font-semibold text-red-700 mt-1">{absentToday}</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-orange-600">Half Day</h3>
            <p className="text-2xl font-semibold text-orange-700 mt-1">{halfDayToday}</p>
          </div>
        </div>
      </div>

      {/* Weekly Attendance Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Weekly Attendance</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Present</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Late</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Absent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Half Day</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {adminWeeklyAttendance.map((day) => (
                <tr key={day.date}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(day.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {day.present}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      {day.late}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      {day.absent}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                      {day.halfDay}
                    </span>
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

export default AdminDashboard; 