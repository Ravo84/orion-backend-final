import { prisma } from "../lib/prisma.js";

export const createChatMessage = async (projectId: string, senderId: string, content: string) => {
  const message = await prisma.chatMessage.create({
    data: {
      projectId,
      senderId,
      content
    },
    select: messageSelect
  });

  return formatMessage(message);
};

export const getRecentMessages = async (projectId: string, take = 30) => {
  const messages = await prisma.chatMessage.findMany({
    where: { projectId },
    select: messageSelect,
    orderBy: { createdAt: "desc" },
    take
  });

  return messages.reverse().map(formatMessage);
};

export const isUserAssignedToProject = async (projectId: string, userId: string) => {
  const [assignment, project, user] = await Promise.all([
    prisma.projectAssignment.findFirst({
      where: {
        projectId,
        userId
      }
    }),
    prisma.project.findUnique({
      where: { id: projectId },
      select: { managerId: true }
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    })
  ]);

  if (assignment) return true;
  if (project?.managerId === userId) return true;
  if (user?.role === "SUPER_ADMIN" || user?.role === "ADMIN") return true;

  return false;
};

const messageSelect = {
  id: true,
  projectId: true,
  content: true,
  createdAt: true,
  sender: {
    select: {
      id: true,
      email: true,
      role: true,
      firstName: true,
      lastName: true
    }
  }
} as const;

const formatMessage = (message: {
  id: string;
  projectId: string;
  content: string;
  createdAt: Date;
  sender: { id: string; email: string; role: string; firstName: string; lastName: string };
}) => ({
  id: message.id,
  projectId: message.projectId,
  content: message.content,
  createdAt: message.createdAt,
  sender: {
    id: message.sender.id,
    email: message.sender.email,
    role: message.sender.role,
    firstName: message.sender.firstName,
    lastName: message.sender.lastName,
    fullName: `${message.sender.firstName} ${message.sender.lastName}`.trim()
  }
});

