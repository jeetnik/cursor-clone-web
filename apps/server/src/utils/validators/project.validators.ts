import { z } from "zod";

const createProjectSchema = z.object({
    name: z
        .string()
        .min(1, { message: "Project name is required" })
        .max(100, { message: "Project name must be at most 100 characters" }),
    settings: z.any().optional(),
});

const updateProjectSchema = z.object({
    name: z
        .string()
        .min(1, { message: "Project name is required" })
        .max(100, { message: "Project name must be at most 100 characters" })
        .optional(),
    settings: z.any().optional(),
});

export { createProjectSchema, updateProjectSchema };
