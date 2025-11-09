import { Router } from "express";

// FIX 1: Path alias changed to relative path AND .js extension added
import {
  changePasswordHandler,
  deactivateUserHandler,
  getUserHandler,
  listUsersHandler,
  reactivateUserHandler,
  updateUserHandler
} from "../controllers/user.controller.js"; 
// FIX 2: Path alias changed to relative path AND .js extension added
import { authenticate, requireRoles, requireSelfOrRoles } from "../middlewares/auth.js"; 
// FIX 3: Path alias changed to relative path AND .js extension added
import type { UserRole } from "../types/enums.js"; 

const router = Router();

router.use(authenticate);
router.get("/", requireRoles("SUPER_ADMIN", "ADMIN", "PROJECT_MANAGER"), listUsersHandler);
router.get("/:id", requireSelfOrRoles("SUPER_ADMIN", "ADMIN", "PROJECT_MANAGER"), getUserHandler);
router.patch(
  "/:id",
  requireSelfOrRoles("SUPER_ADMIN", "ADMIN", "PROJECT_MANAGER"),
  updateUserHandler
);
router.post(
  "/:id/password",
  requireSelfOrRoles("SUPER_ADMIN", "ADMIN"),
  changePasswordHandler
);
router.post("/:id/deactivate", requireRoles("SUPER_ADMIN", "ADMIN"), deactivateUserHandler);
router.post("/:id/reactivate", requireRoles("SUPER_ADMIN", "ADMIN"), reactivateUserHandler);

export { router as userRouter };