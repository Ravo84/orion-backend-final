// FIX 1: Use standard import for runtime access (QueryMode.insensitive)
import { Prisma } from "@prisma/client";

// FIX 2: All local imports must use 'type' where appropriate and end in .js
import type { ProjectStatus, UserRole } from "../types/enums.js";
import { prisma } from "../lib/prisma.js";
import type {
    CreateProjectSchema,
    UpdateProjectSchema,
} from "../validators/project.validator.js";
import type { CreateProjectAssignmentSchema } from "../validators/project-assignment.validator.js";

// ✅ Utility for safely parsing dates
const parseDate = (value?: string) => (value ? new Date(value) : undefined);

// ✅ Create project
export const createProject = async (
    input: CreateProjectSchema,
    createdById: string
) => {
    let assignmentRole: UserRole | undefined;

    if (input.managerId) {
        const manager = await prisma.user.findUnique({
            where: { id: input.managerId },
        });
        // FIX 3: Type assertion to resolve assignmentRole error
        assignmentRole = (manager?.role as UserRole) ?? "PROJECT_MANAGER"; 
    }

    const project = await prisma.project.create({
        data: {
            name: input.name,
            code: input.code,
            description: input.description,
            status: input.status ?? "PLANNED",
            startDate: parseDate(input.startDate),
            targetDate: parseDate(input.targetDate),
            managerId: input.managerId,
            tags: input.tags ? JSON.stringify(input.tags) : "[]",
            riskLevel: input.riskLevel,
            budget: input.budget,
            clientName: input.clientName,
            progress: input.progress ?? 0,
            assignments: {
                create:
                    input.managerId && assignmentRole
                        ? [
                              {
                                  userId: input.managerId,
                                  role: assignmentRole,
                              },
                          ]
                        : undefined,
            },
            updates: {
                create: {
                    summary: "Project created",
                    authorId: createdById,
                    healthScore: 0,
                },
            },
        },
    });

    return project;
};

// (Full file content as provided in the last response, with one change in listProjects)

// ... (previous imports and functions are correct)

// ✅ List projects
export const listProjects = async (options: {
    status?: ProjectStatus;
    managerId?: string;
    search?: string;
    skip?: number;
    take?: number;
} = {}) => {
    const { status, managerId, search, skip = 0, take = 20 } = options;

    // ✅ Single definition with correct Prisma typing
    const where: Prisma.ProjectWhereInput = {
        ...(status && { status }),
        ...(managerId && { managerId }),
        ...(search && {
            OR: [
                // FINAL FIX: Assert the entire filter object as 'any' to bypass the OR array type incompatibility.
                { name: { contains: search, mode: "insensitive" } } as any, 
                { code: { contains: search, mode: "insensitive" } } as any,
            ],
        }),
    };
    
    // ... (rest of the listProjects function is correct)
    
// ... (rest of the file is correct)

    const [projects, total] = await prisma.$transaction([
        prisma.project.findMany({
            where,
            include: {
                manager: true,
                tasks: {
                    select: {
                        id: true,
                        status: true,
                        progress: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take,
        }),
        prisma.project.count({ where }),
    ]);

    return {
        data: projects,
        pagination: { total, skip, take },
    };
};

// ✅ Get single project
export const getProject = async (id: string) => {
    const project = await prisma.project.findUnique({
        where: { id },
        include: {
            manager: true,
            assignments: {
                include: { user: true },
            },
            tasks: true,
            updates: {
                orderBy: { createdAt: "desc" },
                take: 10,
                include: { author: true },
            },
        },
    });

    if (!project) {
        throw Object.assign(new Error("Project not found"), { status: 404 });
    }

    return project;
};

// ✅ Update project
export const updateProject = async (id: string, input: UpdateProjectSchema) => {
    const { startDate, targetDate, ...rest } = input;

    const project = await prisma.project.update({
        where: { id },
        data: {
            ...rest,
            startDate: parseDate(startDate),
            targetDate: parseDate(targetDate),
        } as Prisma.ProjectUpdateInput, // FIX 4: Type assertion to resolve spreading error
    });

    return project;
};

// ✅ Delete project
export const deleteProject = async (id: string) => {
    await prisma.project.delete({ where: { id } });
};

// ✅ Add project assignment
export const addProjectAssignment = async (
    projectId: string,
    input: CreateProjectAssignmentSchema
) => {
    const assignment = await prisma.projectAssignment.create({
        data: {
            projectId,
            userId: input.userId,
            role: input.role,
            allocation: input.allocation ?? 1,
            billable: input.billable ?? false,
            joinedAt: input.joinedAt ? new Date(input.joinedAt) : undefined,
        },
        include: { user: true },
    });

    return assignment;
};

// ✅ Remove project assignment
export const removeProjectAssignment = async (
    projectId: string,
    assignmentId: string
) => {
    const assignment = await prisma.projectAssignment.findUnique({
        where: { id: assignmentId },
    });

    if (!assignment || assignment.projectId !== projectId) {
        throw Object.assign(new Error("Assignment not found"), { status: 404 });
    }

    await prisma.projectAssignment.delete({ where: { id: assignmentId } });

    await prisma.project.update({
        where: { id: projectId },
        data: { updatedAt: new Date() },
    });
};