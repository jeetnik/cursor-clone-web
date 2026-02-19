import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
    getFiles,
    createFile,
    getFileById,
    getFilePath,
    updateFile,
    deleteFile,
} from "../controllers/file.controllers";

const fileRouter = Router();

// All file routes require authentication
fileRouter.use(authMiddleware);

// Project-scoped routes
fileRouter.get("/projects/:projectId/files", getFiles);
fileRouter.post("/projects/:projectId/files", createFile);

// File-specific routes
fileRouter.get("/files/:id", getFileById);
fileRouter.get("/files/:id/path", getFilePath);
fileRouter.patch("/files/:id", updateFile);
fileRouter.delete("/files/:id", deleteFile);

export default fileRouter;
