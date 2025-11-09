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

export const updateUserSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  title: z.string().max(120).optional().or(z.literal("")),
  avatarUrl: z.string().url().optional().or(z.literal("")),
  role: z.enum(userRoles).optional(),
  isActive: z.boolean().optional()
});

export const changePasswordSchema = z.object({
  password: z
    .string()
    .min(8)
    .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/, "Password must include upper, lower, and number")
});

export type UpdateUserSchema = z.infer<typeof updateUserSchema>;
export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;

