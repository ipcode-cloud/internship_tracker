import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { updateConfig, addPosition, deletePosition } from '../../store/slices/configSlice';

const PositionSettings = () => {
  const dispatch = useDispatch();
  const { config, loading } = useSelector((state) => state.config);
  const [positions, setPositions] = useState({});
  const [newPositions, setNewPositions] = useState({});

  useEffect(() => {
    if (config?.positions) {
      setPositions(config.positions);
      // Initialize newPositions for each department
      const initialNewPositions = {};
      config.departments?.forEach(dept => {
        initialNewPositions[dept] = '';
      });
      setNewPositions(initialNewPositions);
    }
  }, [config]);

  const handleAddPosition = async (department) => {
    if (!newPositions[department]?.trim()) return;
    
    try {
      const position = newPositions[department].trim();
      await dispatch(addPosition({ 
        department, 
        position 
      })).unwrap();
      
      // Update local state
      setPositions(prev => ({
        ...prev,
        [department]: [...(prev[department] || []), position]
      }));
      
      // Clear input
      setNewPositions(prev => ({
        ...prev,
        [department]: ''
      }));
      
      toast.success('Position added successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to add position');
    }
  };

  const handleDeletePosition = async (department, position) => {
    try {
      await dispatch(deletePosition({ 
        department, 
        position 
      })).unwrap();
      
      // Update local state
      setPositions(prev => ({
        ...prev,
        [department]: (prev[department] || []).filter(p => p !== position)
      }));
      
      toast.success('Position deleted successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to delete position');
    }
  };

  const handleInputChange = (department, value) => {
    setNewPositions(prev => ({
      ...prev,
      [department]: value
    }));
  };

  if (!config) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Position Settings</h1>
      
      {config.departments?.map((department) => (
        <div key={department} className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">{department}</h2>
          
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newPositions[department] || ''}
              onChange={(e) => handleInputChange(department, e.target.value)}
              placeholder="Add new position"
              className="flex-1 px-3 py-2 border rounded-md"
              disabled={loading}
            />
            <button
              onClick={() => handleAddPosition(department)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
              disabled={loading}
            >
              Add
            </button>
          </div>

          <div className="space-y-2">
            {(positions[department] || []).map((position) => (
              <div key={position} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <span>{position}</span>
                <button
                  onClick={() => handleDeletePosition(department, position)}
                  className="text-red-500 hover:text-red-700 disabled:text-red-300"
                  disabled={loading}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PositionSettings; 