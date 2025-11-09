import { Router } from "express";

// FIX 1: Path alias changed to relative path AND .js extension added
import {
  createTaskHandler,
  deleteTaskHandler,
  getTaskHandler,
  listTasksHandler,
  updateTaskHandler
} from "../controllers/task.controller.js";
// FIX 2: Path alias changed to relative path AND .js extension added
import { authenticate, requireRoles } from "../middlewares/auth.js";
// FIX 3: Path alias changed to relative path AND .js extension added
import type { UserRole } from "../types/enums.js";

const router = Router();

router.use(authenticate);

router.get("/", listTasksHandler);
router.post(
  "/",
  requireRoles("SUPER_ADMIN", "ADMIN", "PROJECT_MANAGER", "TEAM_LEAD"),
  createTaskHandler
);
router.get("/:id", getTaskHandler);
router.patch("/:id", updateTaskHandler);
router.delete(
  "/:id",
  requireRoles("SUPER_ADMIN", "ADMIN", "PROJECT_MANAGER"),
  deleteTaskHandler
);

export { router as taskRouter };