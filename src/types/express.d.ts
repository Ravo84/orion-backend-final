import type { UserRole } from "./enums";

declare global {
  namespace Express {
    interface RequestUser {
      id: string;
      email: string;
      role: UserRole;
      fullName: string;
    }

    interface Request {
      user?: RequestUser;
    }
  }
}

export {};

