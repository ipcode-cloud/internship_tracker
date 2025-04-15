import { validationResult } from 'express-validator';
import Intern from '../models/intern.model.js';
import User from '../models/user.model.js';

// Get all interns
export const getAllInterns = async (req, res) => {
  try {
    const interns = await Intern.find()
      .populate('mentor', 'firstName lastName email')
      .sort({ createdAt: -1 });
    res.json(interns);
  } catch (error) {
    console.error('Error fetching interns:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single intern
export const getIntern = async (req, res) => {
  try {
    const intern = await Intern.findById(req.params.id)
      .populate('mentor', 'firstName lastName email department');
    if (!intern) {
      return res.status(404).json({ message: 'Intern not found' });
    }
    res.json(intern);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create new intern
export const createIntern = async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const intern = new Intern(req.body);
      await intern.save();
      res.status(201).json(intern);
    } catch (error) {
      console.error("Error creating intern:", error);
      res.status(500).json({ message: "Server error" });
    }
  }

// Update intern
export const updateIntern = async (req, res) => {
  try {
    // If mentor is being updated, verify the new mentor
    if (req.body.mentor) {
      const mentor = await User.findOne({ 
        _id: req.body.mentor,
        role: 'mentor'
      });
      
      if (!mentor) {
        return res.status(400).json({ message: 'Invalid mentor selected' });
      }
    }

    const intern = await Intern.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('mentor', 'firstName lastName email department');

    if (!intern) {
      return res.status(404).json({ message: 'Intern not found' });
    }
    res.json(intern);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Email already exists' });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

// Delete intern
export const deleteIntern = async (req, res) => {
  try {
    const intern = await Intern.findByIdAndDelete(req.params.id);
    if (!intern) {
      return res.status(404).json({ message: 'Intern not found' });
    }
    res.json({ message: 'Intern deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get interns by department
export const getInternsByDepartment = async (req, res) => {
  try {
    const interns = await Intern.find({ department: req.params.department })
      .populate('mentor', 'firstName lastName email department')
      .sort({ createdAt: -1 });
    res.json(interns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get interns by mentor
export const getInternsByMentor = async (req, res) => {
  try {
    const interns = await Intern.find({ mentor: req.params.mentorId })
      .populate('mentor', 'firstName lastName email department')
      .sort({ createdAt: -1 });
    res.json(interns);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update intern status
export const updateInternStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const intern = await Intern.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('mentor', 'firstName lastName email department');

    if (!intern) {
      return res.status(404).json({ message: 'Intern not found' });
    }
    res.json(intern);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update intern performance rating
export const updatePerformanceRating = async (req, res) => {
  try {
    const { performanceRating } = req.body;
    const intern = await Intern.findByIdAndUpdate(
      req.params.id,
      { performanceRating },
      { new: true, runValidators: true }
    ).populate('mentor', 'firstName lastName email department');

    if (!intern) {
      return res.status(404).json({ message: 'Intern not found' });
    }
    res.json(intern);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 