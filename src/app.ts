import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env.js"; // FIX 1: Relative path and .js extension
import { notFoundHandler, errorHandler } from "./middlewares/error-handler.js"; // FIX 2: Relative path and .js extension
import { apiRouter } from "./routes/index.js"; // FIX 3: Relative path and .js extension

const app = express();

app.disable("x-powered-by");

app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

app.get("/healthz", (_req, res) => {
  res.json({ status: "healthy" });
});

app.use("/api", apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export { app };