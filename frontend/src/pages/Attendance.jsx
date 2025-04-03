import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAttendance,
  createAttendance,
  deleteAttendance,
} from '../store/slices/attendanceSlice';
import { fetchInterns } from '../store/slices/internSlice';

const AttendanceForm = ({ onSubmit, onCancel }) => {
  const { interns } = useSelector((state) => state.interns);
  const [formData, setFormData] = useState({
    internId: '',
    date: new Date().toISOString().split('T')[0],
    status: 'present',
    checkIn: '',
    checkOut: '',
    notes: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
          {interns
            .filter((intern) => intern.status === 'active')
            .map((intern) => (
              <option key={intern._id} value={intern._id}>
                {intern.name}
              </option>
            ))}
        </select>
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
  const [showForm, setShowForm] = useState(false);
  const [filterDate, setFilterDate] = useState('');
  const [filterIntern, setFilterIntern] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    dispatch(fetchAttendance());
    dispatch(fetchInterns());
  }, [dispatch]);

  const handleSubmit = async (formData) => {
    await dispatch(createAttendance(formData));
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this attendance record?')) {
      await dispatch(deleteAttendance(id));
    }
  };

  const getInternName = (internId) => {
    const intern = interns.find((i) => i._id === internId);
    return intern ? intern.name : 'Unknown';
  };

  const filteredAttendance = attendance.filter((record) => {
    const matchesDate = !filterDate || record.date === filterDate;
    const matchesIntern = !filterIntern || record.internId === filterIntern;
    const matchesStatus = !filterStatus || record.status === filterStatus;
    return matchesDate && matchesIntern && matchesStatus;
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Attendance</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          Mark Attendance
        </button>
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

      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        <select
          value={filterIntern}
          onChange={(e) => setFilterIntern(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="">All Interns</option>
          {interns.map((intern) => (
            <option key={intern._id} value={intern._id}>
              {intern.name}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="">All Status</option>
          <option value="present">Present</option>
          <option value="absent">Absent</option>
          <option value="late">Late</option>
        </select>
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
            {filteredAttendance.map((record) => (
              <tr key={record._id}>
                <td className="px-6 py-4 whitespace-nowrap">{new Date(record.date).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">{getInternName(record.internId)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    record.status === 'present' ? 'bg-green-100 text-green-800' :
                    record.status === 'absent' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {record.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{record.checkIn || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">{record.checkOut || '-'}</td>
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Attendance; 