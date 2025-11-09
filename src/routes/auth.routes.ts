import { Router } from "express";

// FIX 1: Path alias changed to relative path AND .js extension added
import { loginHandler, meHandler, registerHandler } from "../controllers/auth.controller.js"; 
// FIX 2: Path alias changed to relative path AND .js extension added
import { authenticate, requireRoles } from "../middlewares/auth.js"; 
// FIX 3: Path alias changed to relative path AND .js extension added
import type { UserRole } from "../types/enums.js"; 

const router = Router();

router.post("/register", authenticate, requireRoles("SUPER_ADMIN", "ADMIN", "PROJECT_MANAGER"), registerHandler);
router.post("/login", loginHandler);
router.get("/me", authenticate, meHandler);

export { router as authRouter };