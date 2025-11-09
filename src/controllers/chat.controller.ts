import type { NextFunction, Request, Response } from "express";

import { getRecentMessages, isUserAssignedToProject } from "../services/chat.service.js";

export const listMessagesHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const projectId = req.params.id;

    if (!req.user) {
      return res.status(401).json({ message: "Unauthenticated" });
    }

    const allowed = await isUserAssignedToProject(projectId, req.user.id);
    if (!allowed) {
      return res.status(403).json({ message: "Access denied" });
    }

    const messages = await getRecentMessages(projectId);
    res.json({ messages });
  } catch (error) {
    next(error);
  }
};

