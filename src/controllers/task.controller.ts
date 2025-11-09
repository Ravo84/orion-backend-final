import type { NextFunction, Request, Response } from "express";

import { createTask, deleteTask, getTask, listTasks, updateTask } from "../services/task.service.js";
import { createTaskSchema, updateTaskSchema } from "../validators/task.validator.js";
import type { TaskStatus, UserRole } from "../types/enums.js";

export const createTaskHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthenticated" });
    }

    const payload = createTaskSchema.parse(req.body);
    const task = await createTask(payload, req.user.id);
    res.status(201).json({ task });
  } catch (error) {
    next(error);
  }
};

export const listTasksHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const statusParam = req.query.status as string | undefined;
    const validStatuses = ["NOT_STARTED", "IN_PROGRESS", "BLOCKED", "COMPLETED", "DEFERRED"];
    const status = statusParam && validStatuses.includes(statusParam)
      ? (statusParam as TaskStatus)
      : undefined;

    const result = await listTasks({
      projectId: req.query.projectId as string | undefined,
      assigneeId: req.query.assigneeId as string | undefined,
      status,
      skip: req.query.skip ? Number(req.query.skip) : undefined,
      take: req.query.take ? Number(req.query.take) : undefined
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getTaskHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const task = await getTask(req.params.id);
    res.json({ task });
  } catch (error) {
    next(error);
  }
};

export const updateTaskHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthenticated" });
    }

    const payload = updateTaskSchema.parse(req.body);
    const current = await getTask(req.params.id);

    const privilegedRoles: UserRole[] = [
      "SUPER_ADMIN",
      "ADMIN",
      "PROJECT_MANAGER",
      "TEAM_LEAD"
    ];
    const hasPrivilege = privilegedRoles.includes(req.user.role);
    const isAssignee = current.assigneeId === req.user.id;

    if (!hasPrivilege && !isAssignee) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    const task = await updateTask(req.params.id, payload, req.user.id);
    res.json({ task });
  } catch (error) {
    next(error);
  }
};

export const deleteTaskHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteTask(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

