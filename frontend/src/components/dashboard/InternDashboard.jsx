import React from 'react';

const InternDashboard = ({ user, todayStats, weeklyStats, userAttendance }) => {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
        <h2 className="text-xl font-semibold mb-2">Welcome back, {user.firstName}!</h2>
        <p className="mb-4">Here's your internship status and performance overview.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <h3 className="text-sm font-medium opacity-80">Status</h3>
            <p className="text-lg font-semibold mt-1">
              {user.status?.charAt(0).toUpperCase() + user.status?.slice(1).replace('_', ' ') || 'N/A'}
            </p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <h3 className="text-sm font-medium opacity-80">Performance</h3>
            <p className="text-lg font-semibold mt-1">
              {user.performanceRating?.charAt(0).toUpperCase() + user.performanceRating?.slice(1).replace('_', ' ') || 'N/A'}
            </p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <h3 className="text-sm font-medium opacity-80">Project</h3>
            <p className="text-lg font-semibold mt-1">
              {user.projectStatus?.charAt(0).toUpperCase() + user.projectStatus?.slice(1).replace('_', ' ') || 'N/A'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Today's Attendance Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Today's Attendance</h2>
          {todayStats.status ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium ${
                  todayStats.status === 'present' ? 'text-green-600' :
                  todayStats.status === 'late' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {todayStats.status.charAt(0).toUpperCase() + todayStats.status.slice(1)}
                </span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Check-in:</span>
                <span className="font-medium">{todayStats.checkIn || 'Not checked in'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Check-out:</span>
                <span className="font-medium">{todayStats.checkOut || 'Not checked out'}</span>
              </div>
            </>
          ) : (
            <p className="text-gray-500">No attendance recorded for today</p>
          )}
        </div>

        {/* Weekly Stats Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Weekly Statistics</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Present:</span>
              <span className="font-medium text-green-600">{weeklyStats.present} days</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Late:</span>
              <span className="font-medium text-yellow-600">{weeklyStats.late} days</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Absent:</span>
              <span className="font-medium text-red-600">{weeklyStats.absent} days</span>
            </div>
          </div>
        </div>

        {/* Recent Attendance Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Attendance</h2>
          {userAttendance.length > 0 ? (
            <div className="space-y-4">
              {userAttendance.map((record, index) => (
                <div key={index} className="border-b last:border-b-0 pb-3 last:pb-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-600">{new Date(record.date).toLocaleDateString()}</span>
                    <span className={`font-medium ${
                      record.status === 'present' ? 'text-green-600' :
                      record.status === 'late' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {record.checkIn && <span>In: {record.checkIn}</span>}
                    {record.checkIn && record.checkOut && <span className="mx-2">•</span>}
                    {record.checkOut && <span>Out: {record.checkOut}</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No recent attendance records</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InternDashboard; 