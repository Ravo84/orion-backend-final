import type { NextFunction, Request, Response } from "express";

import type { UserRole } from "../types/enums.js"; // FIX 1: Path alias to relative path + .js
import { verifyJwt } from "../utils/jwt.js"; // FIX 2: Path alias to relative path + .js
// FIX 3 (Missing Import): Added getUserById service for full user object resolution
import { getUserById } from "../services/user.service.js"; 

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Missing authorization header" });
  }

  const [, token] = authHeader.split(" ");

  if (!token) {
    return res.status(401).json({ message: "Invalid authorization header" });
  }

  try {
    const decoded = verifyJwt(token);
    
    // FETCH FULL USER to attach to request object
    const user = await getUserById(decoded.sub);
    
    // If user is not found (e.g., deactivated), deny access
    if (!user) {
      return res.status(401).json({ message: "Invalid token or user not found" });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      fullName: user.fullName
    };
    next();
  } catch (error) {
    // Catch token errors (expired, corrupted)
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const requireRoles = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthenticated" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    next();
  };
};

export const requireSelfOrRoles = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthenticated" });
    }

    if (req.params.id === req.user.id) {
      return next();
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    next();
  };
};