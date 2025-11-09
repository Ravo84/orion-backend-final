import type { TaskStatus } from "../types/enums.js";

import { prisma } from "../lib/prisma.js";
import type { CreateTaskSchema, UpdateTaskSchema } from "../validators/task.validator.js";

const parseDate = (value?: string) => (value ? new Date(value) : undefined);

export const createTask = async (input: CreateTaskSchema, authorId: string) => {
  const task = await prisma.task.create({
    data: {
      projectId: input.projectId,
      title: input.title,
      description: input.description,
      status: input.status ?? "NOT_STARTED",
      priority: input.priority,
      assigneeId: input.assigneeId,
      dueDate: parseDate(input.dueDate),
      startDate: parseDate(input.startDate),
      progress: input.progress ?? 0,
      updates: {
        create: {
          authorId,
          comment: "Task created"
        }
      }
    }
  });

  return task;
};

export const listTasks = async (options: {
  projectId?: string;
  assigneeId?: string;
  status?: TaskStatus;
  skip?: number;
  take?: number;
} = {}) => {
  const { projectId, assigneeId, status, skip = 0, take = 25 } = options;

  const where = {
    projectId,
    assigneeId,
    status
  };

  const [tasks, total] = await prisma.$transaction([
    prisma.task.findMany({
      where,
      include: {
        assignee: true,
        project: true
      },
      orderBy: { createdAt: "desc" },
      skip,
      take
    }),
    prisma.task.count({ where })
  ]);

  return { data: tasks, pagination: { total, skip, take } };
};

export const getTask = async (id: string) => {
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      assignee: true,
      project: true,
      updates: {
        orderBy: { createdAt: "desc" },
        include: { author: true }
      }
    }
  });

  if (!task) {
    throw Object.assign(new Error("Task not found"), { status: 404 });
  }

  return task;
};

export const updateTask = async (id: string, input: UpdateTaskSchema, authorId: string) => {
  const { dueDate, startDate, ...rest } = input;

  const task = await prisma.task.update({
    where: { id },
    data: {
      ...rest,
      dueDate: parseDate(dueDate),
      startDate: parseDate(startDate),
      updates: {
        create: {
          authorId,
          comment: "Task updated"
        }
      }
    }
  });

  return task;
};

export const deleteTask = async (id: string) => {
  await prisma.task.delete({ where: { id } });
};

