import type { ProjectStatus } from "../types/enums.js";
import { z } from "zod";

const projectStatuses: [ProjectStatus, ...ProjectStatus[]] = [
  "PLANNED",
  "IN_PROGRESS",
  "AT_RISK",
  "ON_HOLD",
  "COMPLETED",
  "CANCELLED"
];

export const createProjectSchema = z.object({
  name: z.string().min(3),
  code: z
    .string()
    .min(3)
    .regex(/^[A-Z0-9\-]+$/, "Code must be uppercase alphanumeric with dashes only"),
  description: z.string().optional(),
  status: z.enum(projectStatuses).optional(),
  startDate: z.string().datetime().optional(),
  targetDate: z.string().datetime().optional(),
  managerId: z.string().cuid().optional(),
  tags: z.array(z.string().min(1)).optional(),
  riskLevel: z.string().max(64).optional(),
  budget: z.number().nonnegative().optional(),
  clientName: z.string().optional(),
  progress: z.number().int().min(0).max(100).optional()
});

export const updateProjectSchema = createProjectSchema.partial();

export type CreateProjectSchema = z.infer<typeof createProjectSchema>;
export type UpdateProjectSchema = z.infer<typeof updateProjectSchema>;

