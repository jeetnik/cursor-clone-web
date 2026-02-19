import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
    getConversations,
    createConversation,
    getConversationById,
    getConversationMessages,
} from "../controllers/conversation.controllers";

const conversationRouter = Router();

// All conversation routes require authentication
conversationRouter.use(authMiddleware);

// Project-scoped routes
conversationRouter.get("/projects/:projectId/conversations", getConversations);
conversationRouter.post("/projects/:projectId/conversations", createConversation);

// Conversation-specific routes
conversationRouter.get("/conversations/:id", getConversationById);
conversationRouter.get("/conversations/:id/messages", getConversationMessages);

export default conversationRouter;
