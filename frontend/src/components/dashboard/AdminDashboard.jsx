import React from "react";
import { Link } from "react-router-dom";

const AdminDashboard = ({
  interns,
  presentToday,
  absentToday,
  lateToday,
  halfDayToday,
  adminWeeklyAttendance,
  performanceStats,
  projectStats,
}) => {
  return (
    <div className="space-y-6">
      {/* Overview Section */}
      <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-lg shadow-lg p-6 text-white">
        <h2 className="text-xl font-semibold mb-2">Admin Dashboard</h2>
        <p className="mb-4">Here's an overview of the internship program.</p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <h3 className="text-sm font-medium text-indigo-400">
              Total Interns
            </h3>
            <p className="text-lg font-semibold mt-1 text-indigo-500">
              {interns?.length}
            </p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <h3 className="text-sm font-medium text-green-400">
              Active Interns
            </h3>
            <p className="text-lg font-semibold mt-1 text-green-500">
              {interns?.filter((intern) => intern?.status === "active").length}
            </p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <h3 className="text-sm font-medium text-yellow-400">Performance</h3>
            <div className="mt-1">
              <p className="text-lg font-semibold text-yellow-500">
                {performanceStats?.excellent} Excellent
              </p>
              <p className="text-sm text-yellow-400">
                {performanceStats?.good} Good, {performanceStats?.average}{" "}
                Average
              </p>
              <p className="text-sm text-yellow-300">
                {performanceStats?.needs_improvement} Needs Improvement
              </p>
            </div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <h3 className="text-sm font-medium text-purple-400">Projects</h3>
            <p className="text-lg font-semibold mt-1 text-purple-500">
              {projectStats?.completed} Completed
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/interns"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors text-center"
          >
            Manage Interns
          </Link>
          <Link
            to="/attendance"
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-center"
          >
            Manage Attendance
          </Link>
          <Link
            to="/mentors"
            className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors text-center"
          >
            Manage Mentors
          </Link>
        </div>
      </div>

      {/* Interns List Section */}

      {/* Attendance Overview Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Today's Attendance</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-green-100 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-green-800">Present</h4>
            <p className="text-2xl font-bold text-green-600">{presentToday}</p>
          </div>
          <div className="bg-red-100 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-red-800">Absent</h4>
            <p className="text-2xl font-bold text-red-600">{absentToday}</p>
          </div>
          <div className="bg-yellow-100 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-yellow-800">Late</h4>
            <p className="text-2xl font-bold text-yellow-600">{lateToday}</p>
          </div>
          <div className="bg-blue-100 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800">Half Day</h4>
            <p className="text-2xl font-bold text-blue-600">{halfDayToday}</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Interns</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {interns?.map((intern) => (
                <tr key={intern._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {intern.firstName} {intern.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {intern.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {intern.department}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        intern.status === "active"
                          ? "bg-green-100 text-green-800"
                          : intern.status === "completed"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {intern.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link
                        to={`/interns/${intern._id}`}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View Profile
                      </Link>
                      <Link
                        to={`/interns/${intern._id}/progress`}
                        className="text-green-600 hover:text-green-900"
                      >
                        Update Progress
                      </Link>
                      <Link
                        to={`/attendance?intern=${intern._id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Attendance
                      </Link>
                    </div>
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
