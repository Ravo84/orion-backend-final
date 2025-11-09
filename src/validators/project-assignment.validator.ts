import type { UserRole } from "../types/enums.js";
import { z } from "zod";

const userRoles: [UserRole, ...UserRole[]] = [
  "SUPER_ADMIN",
  "ADMIN",
  "PROJECT_MANAGER",
  "TEAM_LEAD",
  "TEAM_MEMBER",
  "STAKEHOLDER"
];

export const createProjectAssignmentSchema = z.object({
  userId: z.string().cuid(),
  role: z.enum(userRoles),
  allocation: z.number().min(0).max(1).optional(),
  billable: z.boolean().optional(),
  joinedAt: z.string().datetime().optional()
});

export type CreateProjectAssignmentSchema = z.infer<typeof createProjectAssignmentSchema>;

