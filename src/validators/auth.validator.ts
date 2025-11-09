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

export const registerSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/, "Password must include upper, lower, and number"),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(userRoles).optional()
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export type RegisterSchema = z.infer<typeof registerSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;

