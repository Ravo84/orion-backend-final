import type { NextFunction, Request, Response } from "express";

import {
  deleteConfiguration,
  listConfigurations,
  upsertConfiguration
} from "../services/configuration.service.js";
import { upsertConfigurationSchema } from "../validators/configuration.validator.js";

export const listConfigurationsHandler = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const configurations = await listConfigurations();
    res.json({ configurations });
  } catch (error) {
    next(error);
  }
};

export const upsertConfigurationHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = upsertConfigurationSchema.parse(req.body);
    const configuration = await upsertConfiguration(payload);
    res.status(201).json({ configuration });
  } catch (error) {
    next(error);
  }
};

export const deleteConfigurationHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteConfiguration(req.params.key);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

