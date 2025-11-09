import { Router } from "express";

import {
  createProjectHandler,
  deleteProjectHandler,
  getProjectHandler,
  listProjectsHandler,
  updateProjectHandler,
  addProjectAssignmentHandler,
  removeProjectAssignmentHandler
} from "../controllers/project.controller.js"; // FIX: Relative path and .js extension
import { listMessagesHandler } from "../controllers/chat.controller.js"; // FIX: Relative path and .js extension
import { authenticate, requireRoles } from "../middlewares/auth.js"; // FIX: Relative path and .js extension
import type { UserRole } from "../types/enums.js"; // FIX: Relative path and .js extension

const router = Router();

router.use(authenticate);

router.get("/", listProjectsHandler);
router.post(
  "/",
  requireRoles("SUPER_ADMIN", "ADMIN", "PROJECT_MANAGER"),
  createProjectHandler
);
router.get("/:id", getProjectHandler);
router.patch(
  "/:id",
  requireRoles("SUPER_ADMIN", "ADMIN", "PROJECT_MANAGER"),
  updateProjectHandler
);
router.delete(
  "/:id",
  requireRoles("SUPER_ADMIN", "ADMIN"),
  deleteProjectHandler
);
router.get("/:id/messages", listMessagesHandler);
router.post(
  "/:id/assignments",
  requireRoles("SUPER_ADMIN", "ADMIN", "PROJECT_MANAGER"),
  addProjectAssignmentHandler
);
router.delete(
  "/:id/assignments/:assignmentId",
  requireRoles("SUPER_ADMIN", "ADMIN", "PROJECT_MANAGER"),
  removeProjectAssignmentHandler
);

export { router as projectRouter };