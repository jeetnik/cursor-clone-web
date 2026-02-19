import { z } from "zod";

const createFileSchema = z.object({
    name: z
        .string()
        .min(1, { message: "File name is required" })
        .max(255, { message: "File name must be at most 255 characters" }),
    type: z.enum(["file", "folder"], {
        message: "Type must be 'file' or 'folder'",
    }),
    content: z.string().optional(),
    parentId: z.string().uuid().optional().nullable(),
});

const updateFileSchema = z.object({
    name: z
        .string()
        .min(1, { message: "File name is required" })
        .max(255, { message: "File name must be at most 255 characters" })
        .optional(),
    content: z.string().optional(),
});

export { createFileSchema, updateFileSchema };
