import Config from '../models/config.model.js';

// Get configuration
export const getConfig = async (req, res) => {
  try {
    let config = await Config.findOne();
    
    // If no config exists, create default config
    if (!config) {
      config = await Config.create({
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
      });
    }
    
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update configuration
export const updateConfig = async (req, res) => {
  try {
    const config = await Config.findOneAndUpdate(
      {},
      req.body,
      { new: true, upsert: true, runValidators: true }
    );
    res.json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
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