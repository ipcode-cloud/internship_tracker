import Config from "../models/config.model.js";

export const getAllConfig = async (req, res) => {
  try {
    const configs = await Config.find();
    res.json(configs);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const createConfig = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, values } = req.body;

    // Check if configuration type already exists
    let config = await Config.findOne({ type });

    if (config) {
      // Update existing values
      config.values = [...new Set([...config.values, ...values])]; // Remove duplicates
      await config.save();
    } else {
      // Create new configuration
      config = new Config({
        type,
        values,
      });
      await config.save();
    }

    res.status(201).json(config);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
export const deleteConfig = async (req, res) => {
  try {
    const { type, value } = req.params;

    const config = await Config.findOne({ type });
    if (!config) {
      return res.status(404).json({ message: "Configuration not found" });
    }

    config.values = config.values.filter((v) => v !== value);
    await config.save();

    res.json(config);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
