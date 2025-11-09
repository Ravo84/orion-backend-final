import type { UserRole } from "../types/enums.js";

import { prisma } from "../lib/prisma.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { signJwt } from "../utils/jwt.js";

export type RegisterUserInput = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
};

export type LoginInput = {
  email: string;
  password: string;
};

const projectManagerOrAbove: UserRole[] = [
  "SUPER_ADMIN",
  "ADMIN",
  "PROJECT_MANAGER",
  "TEAM_LEAD"
];

const toUserResponse = (user: { id: string; email: string; role: UserRole; firstName: string; lastName: string }) => ({
  id: user.id,
  email: user.email,
  role: user.role,
  fullName: `${user.firstName} ${user.lastName}`.trim()
});

export const registerUser = async (input: RegisterUserInput, createdBy?: { id: string; role: UserRole }) => {
  const { email, password, firstName, lastName, role = "TEAM_MEMBER" } = input;

  if (createdBy && !projectManagerOrAbove.includes(createdBy.role) && role !== "TEAM_MEMBER") {
    throw Object.assign(new Error("Insufficient privileges to assign elevated roles"), { status: 403 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    throw Object.assign(new Error("Email already in use"), { status: 409 });
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName,
      lastName,
      role
    }
  });

  return toUserResponse(user as any);
};

export const authenticateUser = async ({ email, password }: LoginInput) => {
  const user = await prisma.user.findUnique({ where: { email } });

  // 🛑 FIX: Separate the null check from the property check.
  // 1. If user is null (not found), throw the error and exit the function.
  if (!user) {
    throw Object.assign(new Error("Invalid credentials"), { status: 401 });
  }

  // 2. Since the function hasn't exited, TypeScript now knows 'user' is NOT null.
  //    We can safely check the isActive property.
  if (!user.isActive) {
    throw Object.assign(new Error("Invalid credentials"), { status: 401 });
  }

  // Rest of the logic is now safe because 'user' is guaranteed to be an object.
  const valid = await verifyPassword(password, user.passwordHash);

  if (!valid) {
    throw Object.assign(new Error("Invalid credentials"), { status: 401 });
  }

  const payload = toUserResponse(user as any);
  const token = signJwt({ sub: payload.id, email: payload.email, role: payload.role, fullName: payload.fullName });

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() }
  });

  return { token, user: payload };
};

export const ensureSeedAdmin = async () => {
  const existing = await prisma.user.findFirst({
    where: {
      // **role: "SUPER_ADMIN" **
      // **CRITICAL FIX: Check by the unique email, not the role**
      email: "founder@orion.local"
    }
  });

  if (existing) {
    return existing;
  }

  const password = await hashPassword("ChangeMe123!#");

  const user = await prisma.user.create({
    data: {
      email: "founder@orion.local",
      passwordHash: password,
      firstName: "Orion",
      lastName: "Admin",
      role: "SUPER_ADMIN"
    }
  });

  return user;
};

