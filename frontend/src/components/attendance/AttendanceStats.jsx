import React from 'react';

const AttendanceStats = ({ attendance, accessibleInterns }) => {
  // Calculate today's attendance
  const today = new Date();
  const todayString = today.toDateString();
  const todayAttendance = attendance.filter(record => 
    new Date(record.date).toDateString() === todayString
  );

  const presentToday = todayAttendance.filter(record => record.status === 'present').length;
  const absentToday = todayAttendance.filter(record => record.status === 'absent').length;
  const lateToday = todayAttendance.filter(record => record.status === 'late').length;

  // Calculate weekly attendance
  const weeklyAttendance = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toDateString();
    
    const dayAttendance = attendance.filter(record => 
      new Date(record.date).toDateString() === dateString
    );

    return {
      date: date.toISOString().split('T')[0],
      present: dayAttendance.filter(record => record.status === 'present').length,
      absent: dayAttendance.filter(record => record.status === 'absent').length,
      late: dayAttendance.filter(record => record.status === 'late').length,
    };
  }).reverse();

  return (
    <div className="space-y-6">
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
        </div>
      </div>

      {/* Weekly Attendance Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Weekly Attendance Trend</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Present</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Late</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Absent</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {weeklyAttendance.map((day) => (
                <tr key={day.date}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(day.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                    {day.present}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600">
                    {day.late}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                    {day.absent}
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

export default AttendanceStats; 