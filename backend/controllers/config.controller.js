import Config from '../models/config.model.js';

// Get configuration (public)
export const getConfig = async (req, res) => {
  try {
    let config = await Config.findOne();
    if (!config) {
      // Create default config if none exists
      config = new Config({
        companyName: 'Company Name',
        workingHours: {
          start: '09:00',
          end: '17:00'
        },
        departments: [],
        positions: []
      });
      await config.save();
    }
    res.json(config);
  } catch (error) {
    console.error('Error fetching config:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create configuration (admin only)
export const createConfig = async (req, res) => {
  try {
    const config = new Config(req.body);
    await config.save();
    res.status(201).json(config);
  } catch (error) {
    console.error('Error creating config:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update configuration (admin only)
export const updateConfig = async (req, res) => {
  try {
    const config = await Config.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!config) {
      return res.status(404).json({ message: 'Config not found' });
    }
    res.json(config);
  } catch (error) {
    console.error('Error updating config:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete configuration (admin only)
export const deleteConfig = async (req, res) => {
  try {
    const config = await Config.findByIdAndDelete(req.params.id);
    if (!config) {
      return res.status(404).json({ message: 'Config not found' });
    }
    res.json({ message: 'Config deleted successfully' });
  } catch (error) {
    console.error('Error deleting config:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update departments
export const updateDepartments = async (req, res) => {
  try {
    const { departments } = req.body;
    const config = await Config.findOneAndUpdate(
      {},
      { departments },
      { new: true, upsert: true, runValidators: true }
    );
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update positions
export const updatePositions = async (req, res) => {
  try {
    const { positions } = req.body;
    const config = await Config.findOneAndUpdate(
      {},
      { positions },
      { new: true, upsert: true, runValidators: true }
    );
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update working hours
export const updateWorkingHours = async (req, res) => {
  try {
    const { workingHours } = req.body;
    const config = await Config.findOneAndUpdate(
      {},
      { workingHours },
      { new: true, upsert: true, runValidators: true }
    );
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Reset configuration to default
export const resetConfig = async (req, res) => {
  try {
    const defaultConfig = {
      companyName: 'Default Company',
      workingHours: {
        start: '09:00',
        end: '17:00'
      },
      departments: [
        'IT',
        'Software Development',
        'Data Science',
        'UI/UX',
        'Marketing',
        'HR',
        'Finance',
        'Operations',
        'Networking'
      ],
      positions: [
        'Intern',
        'Junior Developer',
        'Senior Developer',
        'Team Lead',
        'Project Manager'
      ]
    };

    const config = await Config.findOneAndUpdate(
      {},
      defaultConfig,
      { new: true, upsert: true, runValidators: true }
    );
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 