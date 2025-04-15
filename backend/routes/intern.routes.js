import express from "express";
import { body, validationResult } from "express-validator";
import Intern from "../models/intern.model.js";
import { auth, checkRole } from "../middleware/auth.middleware.js";
import {
  createIntern,
  getAllInterns,
  getIntern,
  updateIntern,
} from "../controllers/intern.controller.js";
import {
  createInternValidators,
  updateInternValidators,
} from "../middleware/InternValidators.js";

const router = express.Router();

// Get all interns (admin and mentor only)
router.get("/", auth, checkRole(["admin", "mentor"]), getAllInterns);

// Get intern by ID
router.get("/:id", auth, getIntern);

// Create new intern (admin only)
router.post(
  "/",
  auth,
  checkRole(["admin", "mentor"]),
  createInternValidators,
  createIntern
);

// Update intern (admin and mentor)
router.put(
  "/:id",
  auth,
  checkRole(["admin", "mentor"]),
  updateInternValidators,
  updateIntern
);

// Update completed status for all interns whose end date has passed
// not applied
router.put(
  "/batch/complete-expired",
  auth,
  checkRole(["admin"]),
  async (req, res) => {
    try {
      // Find and update all interns whose end date is in the past and status is still 'active'
      const result = await Intern.updateMany(
        {
          endDate: { $lt: new Date() },
          status: "active",
        },
        {
          $set: {
            status: "completed",
            updatedAt: new Date(),
          },
        }
      );

      res.json({
        message: "Internship statuses updated successfully",
        updated: result.modifiedCount,
      });
    } catch (error) {
      console.error("Error updating expired internships:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;
