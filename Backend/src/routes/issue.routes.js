
import { Router } from "express";
import {
  createIssue,
  getIssues,
  updateIssueStatus,
} from "../controllers/issue.controller.js";
import { authenticateToken } from "../middleware/auth.middleware.js";

const router = Router();

// Get all campus issues.
router.get("/", getIssues);

// Create an issue. A valid JWT token is required.
router.post("/", authenticateToken, createIssue);

// Update an issue's status. A valid JWT token is required.
router.patch("/:id/status", authenticateToken, updateIssueStatus);

export default router;
