import type { TaskPriority, TaskStatus } from "../types/enums.js";
import { z } from "zod";

const taskStatuses: [TaskStatus, ...TaskStatus[]] = [
  "NOT_STARTED",
  "IN_PROGRESS",
  "BLOCKED",
  "COMPLETED",
  "DEFERRED"
];

const taskPriorities: [TaskPriority, ...TaskPriority[]] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export const createTaskSchema = z.object({
  projectId: z.string().cuid(),
  title: z.string().min(3),
  description: z.string().optional(),
  status: z.enum(taskStatuses).optional(),
  priority: z.enum(taskPriorities).optional(),
  assigneeId: z.string().cuid().optional(),
  dueDate: z.string().datetime().optional(),
  startDate: z.string().datetime().optional(),
  progress: z.number().int().min(0).max(100).optional()
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  projectId: z.string().cuid().optional()
});

export type CreateTaskSchema = z.infer<typeof createTaskSchema>;
export type UpdateTaskSchema = z.infer<typeof updateTaskSchema>;

