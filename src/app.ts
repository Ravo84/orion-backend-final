// Final attempt to fix Render build
// FIX: Use namespace imports for CommonJS modules like express and helmet

import cors from "cors";
import express, { Application, Request, Response, NextFunction } from "express"; // Import Application, Request, Response, NextFunction types
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env.js";
import { notFoundHandler, errorHandler } from "./middlewares/error-handler.js";
import { apiRouter } from "./routes/index.js";

const app: Application = express();

app.disable("x-powered-by");

app.use(helmet()); // helmet is fine as a function call
app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

// FIX: Explicitly type _req as Request and res as Response
app.get("/healthz", (_req: Request, res: Response) => {
  res.json({ status: "healthy" });
});

app.use("/api", apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export { app };