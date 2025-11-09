// String literal types for SQLite compatibility (replaces Prisma enums)

export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "PROJECT_MANAGER"
  | "TEAM_LEAD"
  | "TEAM_MEMBER"
  | "STAKEHOLDER";

export type ProjectStatus =
  | "PLANNED"
  | "IN_PROGRESS"
  | "AT_RISK"
  | "ON_HOLD"
  | "COMPLETED"
  | "CANCELLED";

export type TaskStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "BLOCKED"
  | "COMPLETED"
  | "DEFERRED";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

