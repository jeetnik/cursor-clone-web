import type { Response } from "express";
import type { AuthRequest } from "../middlewares/auth.middleware";
import { createConversationSchema } from "../utils/validators/conversation.validators";
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

// Helper: verify the user owns the conversation (through project ownership)
const verifyConversationOwnership = async (conversationId: string, userEmail: string) => {
    const user = await prisma.user.findUnique({
        where: { email: userEmail },
    });
    if (!user) return null;

    const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: { project: true },
    });
    if (!conversation || conversation.project.ownerId !== user.id) return null;

    return { user, conversation };
};

// GET /projects/:projectId/conversations
// List all conversations in a project
const getConversations = asyncHandler(async (req: AuthRequest, res: Response) => {
    const projectId = req.params.projectId as string;

    const ownership = await verifyProjectOwnership(projectId, req.userEmail!);
    if (!ownership) {
        return res.status(404).json({ error: "Project not found" });
    }

    const conversations = await prisma.conversation.findMany({
        where: { projectId },
        orderBy: { updatedAt: "desc" },
        include: {
            _count: { select: { messages: true } },
        },
    });

    res.status(200).json({ conversations });
});

// POST /projects/:projectId/conversations
// Create a new conversation
const createConversation = asyncHandler(async (req: AuthRequest, res: Response) => {
    const projectId = req.params.projectId as string;
    const { title } = createConversationSchema.parse(req.body);

    const ownership = await verifyProjectOwnership(projectId, req.userEmail!);
    if (!ownership) {
        return res.status(404).json({ error: "Project not found" });
    }

    const conversation = await prisma.conversation.create({
        data: {
            title,
            projectId,
        },
    });

    res.status(201).json({ message: "Conversation created successfully", conversation });
});

// GET /conversations/:id
// Get conversation details
const getConversationById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;

    const ownership = await verifyConversationOwnership(id, req.userEmail!);
    if (!ownership) {
        return res.status(404).json({ error: "Conversation not found" });
    }

    const conversation = await prisma.conversation.findUnique({
        where: { id },
        include: {
            _count: { select: { messages: true } },
        },
    });

    res.status(200).json({ conversation });
});

// GET /conversations/:id/messages
// Get all messages in a conversation
const getConversationMessages = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;

    const ownership = await verifyConversationOwnership(id, req.userEmail!);
    if (!ownership) {
        return res.status(404).json({ error: "Conversation not found" });
    }

    const messages = await prisma.message.findMany({
        where: { conversationId: id },
        orderBy: { createdAt: "asc" },
    });

    res.status(200).json({ messages });
});

export { getConversations, createConversation, getConversationById, getConversationMessages };
