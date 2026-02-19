import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
    getProjects,
    createProject,
    getProjectById,
    updateProject,
} from "../controllers/project.controllers";

const projectRouter = Router();

// All project routes require authentication
projectRouter.use(authMiddleware);

projectRouter.get("/", getProjects);
projectRouter.post("/", createProject);
projectRouter.get("/:id", getProjectById);
projectRouter.patch("/:id", updateProject);

export default projectRouter;
