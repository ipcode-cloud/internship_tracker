import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateConfig } from '../../store/slices/configSlice';
import { toast } from 'react-toastify';

const DepartmentSettings = () => {
  const dispatch = useDispatch();
  const { config } = useSelector((state) => state.config);
  const [newDepartment, setNewDepartment] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValue, setEditValue] = useState('');

  const handleAddDepartment = async () => {
    if (!newDepartment.trim()) return;
    
    try {
      const updatedConfig = {
        ...config,
        departments: [...config.departments, newDepartment.trim()]
      };
      await dispatch(updateConfig(updatedConfig)).unwrap();
      setNewDepartment('');
      toast.success('Department added successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to add department');
    }
  };

  const handleEditDepartment = async (index) => {
    if (!editValue.trim()) return;
    
    try {
      const updatedDepartments = [...config.departments];
      updatedDepartments[index] = editValue.trim();
      const updatedConfig = {
        ...config,
        departments: updatedDepartments
      };
      await dispatch(updateConfig(updatedConfig)).unwrap();
      setEditingIndex(null);
      setEditValue('');
      toast.success('Department updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update department');
    }
  };

  const handleDeleteDepartment = async (index) => {
    try {
      const updatedDepartments = config.departments.filter((_, i) => i !== index);
      const updatedConfig = {
        ...config,
        departments: updatedDepartments
      };
      await dispatch(updateConfig(updatedConfig)).unwrap();
      toast.success('Department deleted successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to delete department');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Department Settings</h2>
      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newDepartment}
            onChange={(e) => setNewDepartment(e.target.value)}
            placeholder="Enter new department"
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          <button
            onClick={handleAddDepartment}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Add
          </button>
        </div>
        <div className="space-y-2">
          {config.departments.map((dept, index) => (
            <div key={index} className="flex items-center gap-2">
              {editingIndex === index ? (
                <>
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <button
                    onClick={() => handleEditDepartment(index)}
                    className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingIndex(null);
                      setEditValue('');
                    }}
                    className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <span className="flex-1">{dept}</span>
                  <button
                    onClick={() => {
                      setEditingIndex(index);
                      setEditValue(dept);
                    }}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteDepartment(index)}
                    className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DepartmentSettings; 