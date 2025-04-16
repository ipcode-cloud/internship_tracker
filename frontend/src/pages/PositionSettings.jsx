import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { updateConfig } from '../features/configSlice';

const PositionSettings = () => {
  const dispatch = useDispatch();
  const { config } = useSelector((state) => state.config);
  const [positions, setPositions] = useState({});
  const [newPosition, setNewPosition] = useState('');

  useEffect(() => {
    if (config?.positions) {
      // Convert Map to plain object if it's a Map
      const positionsObj = config.positions instanceof Map 
        ? Object.fromEntries(config.positions)
        : config.positions;
      setPositions(positionsObj);
    }
  }, [config]);

  const handleAddPosition = (department) => {
    if (!newPosition.trim()) return;
    
    const updatedPositions = {
      ...positions,
      [department]: [...(positions[department] || []), newPosition.trim()]
    };
    
    setPositions(updatedPositions);
    setNewPosition('');
  };

  const handleDeletePosition = (department, position) => {
    const updatedPositions = {
      ...positions,
      [department]: (positions[department] || []).filter(p => p !== position)
    };
    
    setPositions(updatedPositions);
  };

  const handleSave = async () => {
    try {
      // Convert back to Map for the API if needed
      const positionsToSave = new Map(Object.entries(positions));
      await dispatch(updateConfig({ positions: positionsToSave })).unwrap();
      toast.success('Positions updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update positions');
    }
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
              value={newPosition}
              onChange={(e) => setNewPosition(e.target.value)}
              placeholder="Add new position"
              className="flex-1 px-3 py-2 border rounded-md"
            />
            <button
              onClick={() => handleAddPosition(department)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
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
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={handleSave}
        className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
      >
        Save Changes
      </button>
    </div>
  );
};

export default PositionSettings; 