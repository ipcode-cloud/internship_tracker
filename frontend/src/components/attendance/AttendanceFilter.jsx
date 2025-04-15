import React from 'react';

const AttendanceFilter = ({
  filterDate,
  setFilterDate,
  filterIntern,
  setFilterIntern,
  filterStatus,
  setFilterStatus,
  searchName,
  setSearchName,
  accessibleInterns,
  user,
  clearFilters
}) => {
  return (
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
      <div className="mt-4">
        <button
          onClick={clearFilters}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default AttendanceFilter; 