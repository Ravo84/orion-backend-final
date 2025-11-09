import type { NextFunction, Request, Response } from "express";

// FIX 1: Missing .js extension
import { authenticateUser, registerUser } from "../services/auth.service.js"; 
// FIX 2: Missing .js extension
import { getUserById } from "../services/user.service.js"; 
// FIX 3: Missing .js extension
import { loginSchema, registerSchema } from "../validators/auth.validator.js"; 

export const registerHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = registerSchema.parse(req.body as any);
    // Line 13 will now resolve correctly because registerUser is properly imported
    const user = await registerUser(payload, req.user); 
    res.status(201).json({ user });
  } catch (error) {
    next(error);
  }
};

export const loginHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = loginSchema.parse(req.body);
    const result = await authenticateUser(payload);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const meHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthenticated" });
    }

    const user = await getUserById(req.user.id);
    res.json({ user });
  } catch (error) {
    next(error);
  }
};