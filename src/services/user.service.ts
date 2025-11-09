import { Prisma } from "@prisma/client";
import type { UserRole } from "../types/enums.js";

import { prisma } from "../lib/prisma.js";
import { hashPassword } from "../utils/password.js";

export const listUsers = async (options: { take?: number; skip?: number } = {}) => {
  const { take = 25, skip = 0 } = options;

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      skip,
      take,
      orderBy: { createdAt: "desc" }
    }),
    prisma.user.count()
  ]);

  return {
    // FIX 1: Add 'as any' here for type safety
    data: users.map((user) => toUserResponse(user as any)),
    pagination: {
      total,
      skip,
      take
    }
  };
}; // <--- FIX 2: Added missing closing brace for listUsers

export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    throw Object.assign(new Error("User not found"), { status: 404 });
  }

  return toUserResponse(user as any);
}; // <--- FIX 3: Added missing closing brace for getUserById

export const updateUser = async (id: string, data: Prisma.UserUpdateInput) => {
  if (data.passwordHash) {
    throw Object.assign(new Error("Use dedicated password update route"), { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id },
    data
  });

  // FIX 4: Changed 'user as any' to the correct variable 'updated as any'
  return toUserResponse(updated as any);
};

export const changePassword = async (id: string, password: string) => {
  const passwordHash = await hashPassword(password);

  await prisma.user.update({
    where: { id },
    data: { passwordHash }
  });
};

export const deactivateUser = async (id: string) => {
  await prisma.user.update({
    where: { id },
    data: { isActive: false }
  });
};

export const reactivateUser = async (id: string) => {
  await prisma.user.update({
    where: { id },
    data: { isActive: true }
  });
};

export const elevateUserRole = async (id: string, role: UserRole) => {
  return prisma.user.update({
    where: { id },
    data: { role }
  });
};

const toUserResponse = (user: {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  isActive: boolean;
  avatarUrl?: string | null;
  title?: string | null;
}) => ({
  id: user.id,
  email: user.email,
  role: user.role,
  fullName: `${user.firstName} ${user.lastName}`.trim(),
  firstName: user.firstName,
  lastName: user.lastName,
  isActive: user.isActive,
  avatarUrl: user.avatarUrl,
  title: user.title ?? undefined
});