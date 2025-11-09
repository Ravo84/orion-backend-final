import type { NextFunction, Request, Response } from "express";

import {
  changePassword,
  deactivateUser,
  getUserById,
  listUsers,
  reactivateUser,
  updateUser
} from "../services/user.service.js";
import { changePasswordSchema, updateUserSchema } from "../validators/user.validator.js";

export const listUsersHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const take = req.query.take ? Number(req.query.take) : undefined;
    const skip = req.query.skip ? Number(req.query.skip) : undefined;

    const result = await listUsers({ take, skip });
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getUserHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const user = await getUserById(id);
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

export const updateUserHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const payload = updateUserSchema.parse(req.body);

    if (payload.role && (!req.user || !["SUPER_ADMIN", "ADMIN"].includes(req.user.role))) {
      return res.status(403).json({ message: "Only administrators can update roles" });
    }

    const user = await updateUser(id, {
      ...payload,
      title: payload.title === "" ? null : payload.title,
      avatarUrl: payload.avatarUrl === "" ? null : payload.avatarUrl
    });
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

export const changePasswordHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const payload = changePasswordSchema.parse(req.body);
    await changePassword(id, payload.password);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const deactivateUserHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await deactivateUser(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const reactivateUserHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await reactivateUser(id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

