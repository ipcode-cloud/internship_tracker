import { body } from "express-validator";

export const createInternValidators = [
  body("firstName").trim().notEmpty(),
  body("lastName").trim().notEmpty(),
  body("email").isEmail().normalizeEmail(),
  body("phone").optional().trim().notEmpty(),
  body("department").optional().trim().notEmpty(),
  body("position").trim().notEmpty(),
  body("startDate").isISO8601(),
  body("endDate").isISO8601(),
  body("mentor").isMongoId(),
];

export const updateInternValidators = [
  body("firstName").optional().trim().notEmpty(),
  body("lastName").optional().trim().notEmpty(),
  body("email").optional().isEmail().normalizeEmail(),
  body("phone").optional().trim().notEmpty(),
  body("department").optional().trim().notEmpty(),
  body("position").optional().trim().notEmpty(),
  body("startDate").optional().isISO8601(),
  body("endDate").optional().isISO8601(),
  body("mentor").optional().isMongoId(),
  body("status")
    .optional()
    .isIn([
      "active",
      "inactive",
      "completed",
      "terminated",
      "extended",
      "on_leave",
    ]),
  body("performanceRating")
    .optional()
    .isIn(["excellent", "good", "average", "needs_improvement"]),
  body("projectStatus")
    .optional()
    .isIn(["not_started", "in_progress", "completed", "delayed", "on_hold"]),
  body("comments").optional().trim(),
];
