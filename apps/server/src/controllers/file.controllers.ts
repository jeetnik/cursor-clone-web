import type { Response } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware";
import {
    createFileSchema,
    updateFileSchema,
} from "../utils/validators/file.validators";
import prisma from "db";
import { asyncHandler } from "../utils/asyncHandler";

// Helper: verify the user owns the project
const verifyProjectOwnership = async (projectId: string, userEmail: string) => {
    const user = await prisma.user.findUnique({
        where: { email: userEmail },
    });
    if (!user) return null;

    const project = await prisma.project.findUnique({
        where: { id: projectId, ownerId: user.id },
    });
    if (!project) return null;

    return { user, project };
};

// Helper: verify the user owns the file (through project ownership)
const verifyFileOwnership = async (fileId: string, userEmail: string) => {
    const user = await prisma.user.findUnique({
        where: { email: userEmail },
    });
    if (!user) return null;

    const file = await prisma.file.findUnique({
        where: { id: fileId },
        include: { project: true },
    });
    if (!file || file.project.ownerId !== user.id) return null;

    return { user, file };
};

// GET /projects/:projectId/files
// List all files in a project, optionally filtered by parentId
const getFiles = asyncHandler(async (req: AuthRequest, res: Response) => {
    const projectId = req.params.projectId as string;
    const parentId = req.query.parentId as string | undefined;

    const ownership = await verifyProjectOwnership(projectId, req.userEmail!);
    if (!ownership) {
        return res.status(404).json({ error: "Project not found" });
    }

    const files = await prisma.file.findMany({
        where: {
            projectId,
            parentId: parentId === undefined ? null : parentId,
        },
        orderBy: [{ type: "asc" }, { name: "asc" }], // folders first, then alphabetical
    });

    res.status(200).json({ files });
});

// POST /projects/:projectId/files
// Create a new file or folder
const createFile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const projectId = req.params.projectId as string;
    const { name, type, content, parentId } = createFileSchema.parse(req.body);

    const ownership = await verifyProjectOwnership(projectId, req.userEmail!);
    if (!ownership) {
        return res.status(404).json({ error: "Project not found" });
    }

    // If parentId is provided, verify the parent exists and belongs to this project
    if (parentId) {
        const parentFile = await prisma.file.findUnique({
            where: { id: parentId, projectId },
        });
        if (!parentFile) {
            return res.status(404).json({ error: "Parent folder not found" });
        }
        if (parentFile.type !== "folder") {
            return res.status(400).json({ error: "Parent must be a folder" });
        }
    }

    // Check for duplicate name in the same directory
    const existing = await prisma.file.findFirst({
        where: { projectId, parentId: parentId ?? null, name },
    });
    if (existing) {
        return res.status(409).json({ error: "A file or folder with this name already exists in this location" });
    }

    const file = await prisma.file.create({
        data: {
            name,
            type,
            content: type === "file" ? (content ?? "") : null,
            projectId,
            parentId: parentId ?? null,
        },
    });

    res.status(201).json({ message: `${type === "folder" ? "Folder" : "File"} created successfully`, file });
});

// GET /files/:id
// Get file content and details
const getFileById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;

    const ownership = await verifyFileOwnership(id, req.userEmail!);
    if (!ownership) {
        return res.status(404).json({ error: "File not found" });
    }

    const file = await prisma.file.findUnique({
        where: { id },
        include: {
            children: {
                orderBy: [{ type: "asc" }, { name: "asc" }],
            },
        },
    });

    res.status(200).json({ file });
});

// GET /files/:id/path
// Get breadcrumb path from root to this file
const getFilePath = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;

    const ownership = await verifyFileOwnership(id, req.userEmail!);
    if (!ownership) {
        return res.status(404).json({ error: "File not found" });
    }

    // Walk up the tree to build the breadcrumb path
    const breadcrumb: { id: string; name: string; type: string }[] = [];
    let currentId: string | null = id;

    while (currentId) {
        const current: { id: string; name: string; type: string; parentId: string | null } | null = await prisma.file.findUnique({
            where: { id: currentId },
            select: { id: true, name: true, type: true, parentId: true },
        });
        if (!current) break;
        breadcrumb.unshift({ id: current.id, name: current.name, type: current.type });
        currentId = current.parentId;
    }

    res.status(200).json({ path: breadcrumb });
});

// PATCH /files/:id
// Update file content or rename
const updateFile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    const data = updateFileSchema.parse(req.body);

    const ownership = await verifyFileOwnership(id, req.userEmail!);
    if (!ownership) {
        return res.status(404).json({ error: "File not found" });
    }

    // If renaming, check for duplicate name in the same directory
    if (data.name && data.name !== ownership.file.name) {
        const existing = await prisma.file.findFirst({
            where: {
                projectId: ownership.file.projectId,
                parentId: ownership.file.parentId,
                name: data.name,
                id: { not: id },
            },
        });
        if (existing) {
            return res.status(409).json({ error: "A file or folder with this name already exists in this location" });
        }
    }

    const file = await prisma.file.update({
        where: { id },
        data: {
            ...(data.name && { name: data.name }),
            ...(data.content !== undefined && { content: data.content }),
        },
    });

    res.status(200).json({ message: "File updated successfully", file });
});

// DELETE /files/:id
// Delete a file or folder (cascade deletes children)
const deleteFile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;

    const ownership = await verifyFileOwnership(id, req.userEmail!);
    if (!ownership) {
        return res.status(404).json({ error: "File not found" });
    }

    await prisma.file.delete({ where: { id } });

    res.status(200).json({ message: "File deleted successfully" });
});

export { getFiles, createFile, getFileById, getFilePath, updateFile, deleteFile };
