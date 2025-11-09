import type { NextFunction, Request, Response } from "express";

export const notFoundHandler = (_req: Request, res: Response) => {
  res.status(404).json({ message: "Resource not found" });
};

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  const status = typeof err === "object" && err !== null && "status" in err ? Number((err as { status?: number }).status) : 500;
  const message =
    typeof err === "object" && err !== null && "message" in err
      ? String((err as { message?: string }).message)
      : "Internal server error";

  res.status(status || 500).json({ message });
};

