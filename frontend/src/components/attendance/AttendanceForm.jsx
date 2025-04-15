import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const AttendanceForm = ({ onSubmit, onCancel, accessibleInterns, initialData }) => {
  const [formData, setFormData] = useState({
    intern: '',
    date: new Date().toISOString().split('T')[0],
    status: 'present',
    checkIn: '',
    checkOut: '',
    notes: ''
  });

  // Initialize form with initialData if provided (for editing)
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Format the date and time values properly
    const formattedData = {
      ...formData,
      date: new Date(formData.date), // Convert date string to Date object
    };

    // Handle different statuses according to validation requirements
    if (formData.status === 'absent') {
      // For absent status, don't include checkIn and checkOut
      delete formattedData.checkIn;
      delete formattedData.checkOut;
    } else {
      // For present/late status, ensure both times are provided
      if (!formData.checkIn || !formData.checkOut) {
        toast.error('Both check-in and check-out times are required for non-absent status');
        return;
      }
      
      // Format the times with the selected date
      formattedData.checkIn = new Date(`${formData.date}T${formData.checkIn}`);
      formattedData.checkOut = new Date(`${formData.date}T${formData.checkOut}`);
      
      // Validate check-out is after check-in
      if (formattedData.checkOut <= formattedData.checkIn) {
        toast.error('Check-out time must be after check-in time');
        return;
      }
    }
    
    onSubmit(formattedData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Intern</label>
        <select
          name="intern"
          value={formData.intern}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="">Select Intern</option>
          {accessibleInterns.map((intern) => (
            <option key={intern._id} value={intern._id}>
              {`${intern.firstName} ${intern.lastName}`}
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
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Status</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="present">Present</option>
          <option value="absent">Absent</option>
          <option value="late">Late</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Check In Time</label>
        <input
          type="time"
          name="checkIn"
          value={formData.checkIn}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Check Out Time</label>
        <input
          type="time"
          name="checkOut"
          value={formData.checkOut}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

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
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          {initialData ? 'Update Attendance' : 'Mark Attendance'}
        </button>
      </div>
    </form>
  );
};

export default AttendanceForm; 