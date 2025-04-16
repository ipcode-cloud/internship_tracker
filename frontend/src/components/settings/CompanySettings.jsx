import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateConfig } from '../../store/slices/configSlice';
import { toast } from 'react-toastify';

const CompanySettings = () => {
  const dispatch = useDispatch();
  const { config } = useSelector((state) => state.config);
  const [companyName, setCompanyName] = useState('');
  const [workingHours, setWorkingHours] = useState({
    start: '09:00',
    end: '17:00'
  });

  // Initialize form data when config is loaded
  useEffect(() => {
    if (config) {
      setCompanyName(config.companyName || '');
      setWorkingHours({
        start: config.workingHours?.start || '09:00',
        end: config.workingHours?.end || '17:00'
      });
    }
  }, [config]);

  const handleSave = async () => {
    try {
      const updatedConfig = {
        ...config,
        companyName,
        workingHours: {
          start: workingHours.start,
          end: workingHours.end
        }
      };
      
      await dispatch(updateConfig(updatedConfig)).unwrap();
      toast.success('Company settings updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update company settings');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Company Settings</h2>
      <div className="space-y-6">
        {/* Company Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company Name
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            placeholder="Enter company name"
          />
        </div>

        {/* Working Hours */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Working Hours</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={workingHours.start}
                onChange={(e) => setWorkingHours(prev => ({ ...prev, start: e.target.value }))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <input
                type="time"
                value={workingHours.end}
                onChange={(e) => setWorkingHours(prev => ({ ...prev, end: e.target.value }))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompanySettings; 