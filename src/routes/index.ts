import { Router } from "express";

// FIX: All relative imports must end with the .js extension
import { authRouter } from "./auth.routes.js";
import { configurationRouter } from "./configuration.routes.js";
import { projectRouter } from "./project.routes.js";
import { taskRouter } from "./task.routes.js";
import { userRouter } from "./user.routes.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/projects", projectRouter);
router.use("/tasks", taskRouter);
router.use("/configurations", configurationRouter);

router.get("/status", (_req, res) => {
  res.json({ status: "ok" });
});

export { router as apiRouter };