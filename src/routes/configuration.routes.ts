import { Router } from "express";

// FIX 1: Path alias changed to relative path AND .js extension added
import {
  deleteConfigurationHandler,
  listConfigurationsHandler,
  upsertConfigurationHandler
} from "../controllers/configuration.controller.js"; 
// FIX 2: Path alias changed to relative path AND .js extension added
import { authenticate, requireRoles } from "../middlewares/auth.js"; 
// FIX 3: Path alias changed to relative path AND .js extension added
import type { UserRole } from "../types/enums.js"; 

const router = Router();

router.use(authenticate, requireRoles("SUPER_ADMIN", "ADMIN"));

router.get("/", listConfigurationsHandler);
router.post("/", upsertConfigurationHandler);
router.delete("/:key", deleteConfigurationHandler);

export { router as configurationRouter };