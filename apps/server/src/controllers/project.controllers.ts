import type { Response } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware";
import {
    createProjectSchema,
    updateProjectSchema,
} from "../utils/validators/project.validators";
import prisma from "db";
import { asyncHandler } from "../utils/asyncHandler";

// GET /projects — List user's projects
const getProjects = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await prisma.user.findUnique({
        where: { email: req.userEmail },
    });

    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    const projects = await prisma.project.findMany({
        where: { ownerId: user.id },
        orderBy: { updatedAt: "desc" },
    });

    res.status(200).json({ projects });
});

// POST /projects — Create a new project
const createProject = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { name, settings } = createProjectSchema.parse(req.body);

    const user = await prisma.user.findUnique({
        where: { email: req.userEmail },
    });

    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    const project = await prisma.project.create({
        data: {
            name,
            ownerId: user.id,
            settings: settings ?? undefined,
        },
    });

    res.status(201).json({ message: "Project created successfully", project });
});

// GET /projects/:id — Get project details
const getProjectById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;

    const user = await prisma.user.findUnique({
        where: { email: req.userEmail },
    });

    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    const project = await prisma.project.findUnique({
        where: { id, ownerId: user.id },
        include: {
            files: true,
            conversations: true,
        },
    });

    if (!project) {
        return res.status(404).json({ error: "Project not found" });
    }

    res.status(200).json({ project });
});

// PATCH /projects/:id — Update settings or rename
const updateProject = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    const data = updateProjectSchema.parse(req.body);

    const user = await prisma.user.findUnique({
        where: { email: req.userEmail },
    });

    if (!user) {
        return res.status(404).json({ error: "User not found" });
    }

    const existing = await prisma.project.findUnique({
        where: { id, ownerId: user.id },
    });

    if (!existing) {
        return res.status(404).json({ error: "Project not found" });
    }

    const project = await prisma.project.update({
        where: { id },
        data: {
            ...(data.name && { name: data.name }),
            ...(data.settings !== undefined && { settings: data.settings }),
        },
    });

    res.status(200).json({ message: "Project updated successfully", project });
});

export { getProjects, createProject, getProjectById, updateProject };
