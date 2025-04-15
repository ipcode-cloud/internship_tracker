import express from "express";
import { body, validationResult } from "express-validator";
import { auth, checkRole } from "../middleware/auth.middleware.js";
import Config from "../models/config.model.js";
import Intern from "../models/intern.model.js";
import {
  createConfig,
  deleteConfig,
  getAllConfig,
} from "../controllers/admin.controller.js";

const router = express.Router();

// Delete inactive or terminated interns
router.delete(
  "/interns/cleanup",
  auth,
  checkRole(["admin"]),
  async (req, res) => {
    try {
      const result = await Intern.deleteMany({
        status: { $in: ["inactive", "terminated"] },
      });

      res.json({
        message: "Inactive and terminated interns deleted successfully",
        deletedCount: result.deletedCount,
      });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Get all configuration values
router.get("/config", auth, checkRole(["admin"]), getAllConfig);

// Add new configuration values
router.post("/config", auth, checkRole(["admin"]), createConfig);

// Remove configuration values
router.delete("/config/:type/:value", auth, checkRole(["admin"]), deleteConfig);

export default router;
