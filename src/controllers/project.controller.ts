import type { NextFunction, Request, Response } from "express";

import {
  createProject,
  deleteProject,
  getProject,
  listProjects,
  updateProject,
  addProjectAssignment,
  removeProjectAssignment
} from "../services/project.service.js";
import { createProjectSchema, updateProjectSchema } from "../validators/project.validator.js";
import { createProjectAssignmentSchema } from "../validators/project-assignment.validator.js";
import type { ProjectStatus } from "../types/enums.js";

export const createProjectHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthenticated" });
    }

    const payload = createProjectSchema.parse(req.body);
    const project = await createProject(payload, req.user.id);
    res.status(201).json({ project });
  } catch (error) {
    next(error);
  }
};

export const listProjectsHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const statusParam = req.query.status as string | undefined;
    const validStatuses = ["PLANNED", "IN_PROGRESS", "AT_RISK", "ON_HOLD", "COMPLETED", "CANCELLED"];
    const status = statusParam && validStatuses.includes(statusParam)
      ? (statusParam as ProjectStatus)
      : undefined;

    const result = await listProjects({
      status,
      managerId: req.query.managerId as string | undefined,
      search: req.query.search as string | undefined,
      skip: req.query.skip ? Number(req.query.skip) : undefined,
      take: req.query.take ? Number(req.query.take) : undefined
    });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getProjectHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const project = await getProject(req.params.id);
    res.json({ project });
  } catch (error) {
    next(error);
  }
};

export const updateProjectHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = updateProjectSchema.parse(req.body);
    const project = await updateProject(req.params.id, payload);
    res.json({ project });
  } catch (error) {
    next(error);
  }
};

export const deleteProjectHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteProject(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const addProjectAssignmentHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = createProjectAssignmentSchema.parse(req.body);
    const assignment = await addProjectAssignment(req.params.id, payload);
    res.status(201).json({ assignment });
  } catch (error) {
    next(error);
  }
};

export const removeProjectAssignmentHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await removeProjectAssignment(req.params.id, req.params.assignmentId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

