import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const MentorDashboard = ({ 
  user, 
  interns, 
  attendance, 
  statusFilter, 
  setStatusFilter, 
  getMentorMentees,
  getMentorId 
}) => {
  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && interns && attendance) {
      const filteredMentees = getMentorMentees();
      setMentees(filteredMentees);
      setLoading(false);
    }
  }, [user, interns, attendance, getMentorMentees]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg shadow-lg p-6 text-white">
        <h2 className="text-xl font-semibold mb-2">Welcome back, {user.firstName}!</h2>
        <p className="mb-4">Here's an overview of your mentees and their performance.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <h3 className="text-sm text-slate-900 font-medium opacity-80">Active Mentees</h3>
            <p className="text-lg text-lime-500 font-bold mt-1">
              {mentees.filter(intern => intern.status === 'active').length}
            </p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <h3 className="text-sm text-slate-900 font-medium opacity-80">Completed Mentees</h3>
            <p className="text-lg text-blue-600 font-bold mt-1">
              {mentees.filter(intern => intern.status === 'completed').length}
            </p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <h3 className="text-sm text-slate-900 font-medium opacity-80">On Leave</h3>
            <p className="text-lg text-orange-600 font-bold mt-1">
              {mentees.filter(intern => intern.status === 'on_leave').length}
            </p>
          </div>
        </div>
      </div>

      {/* Mentees List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Your Mentees ({mentees.length})</h2>
          <div className="flex gap-2">
            <select 
              className="form-select rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              onChange={(e) => setStatusFilter(e.target.value)}
              value={statusFilter}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="on_leave">On Leave</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Today's Attendance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mentees
                .filter(intern => statusFilter === 'all' ? true : intern.status === statusFilter)
                .map((intern) => {
                  const internAttendance = attendance.find(record => 
                    (record.intern._id || record.intern) === intern._id && 
                    new Date(record.date).toDateString() === new Date().toDateString()
                  );

                  return (
                    <tr key={intern._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {intern.firstName} {intern.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {intern.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${intern.status === 'active' ? 'bg-green-100 text-green-800' : 
                          intern.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                          'bg-yellow-100 text-yellow-800'}`}>
                          {intern.status.charAt(0).toUpperCase() + intern.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${intern.performanceRating === 'excellent' ? 'bg-green-100 text-green-800' :
                          intern.performanceRating === 'good' ? 'bg-blue-100 text-blue-800' :
                          intern.performanceRating === 'average' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'}`}>
                          {intern.performanceRating.charAt(0).toUpperCase() + intern.performanceRating.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${intern.projectStatus === 'completed' ? 'bg-green-100 text-green-800' :
                          intern.projectStatus === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          intern.projectStatus === 'not_started' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'}`}>
                          {intern.projectStatus.replace('_', ' ').charAt(0).toUpperCase() + 
                          intern.projectStatus.slice(1).replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${internAttendance?.status === 'present' ? 'bg-green-100 text-green-800' :
                          internAttendance?.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'}`}>
                          {internAttendance ? internAttendance.status.charAt(0).toUpperCase() + 
                          internAttendance.status.slice(1) : 'Absent'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          <Link
                            to={`/interns/${intern._id}`}
                            className="text-indigo-600 hover:text-indigo-900 whitespace-nowrap"
                          >
                            View Profile
                          </Link>
                          <Link
                            to={`/interns/${intern._id}/progress`}
                            className="text-green-600 hover:text-green-900 whitespace-nowrap"
                          >
                            Update Progress
                          </Link>
                          <Link
                            to={`/interns/${intern._id}/attendance`}
                            className="text-blue-600 hover:text-blue-900 whitespace-nowrap"
                          >
                            Manage Attendance
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MentorDashboard; 