import { z } from "zod";

const createConversationSchema = z.object({
    title: z
        .string()
        .min(1, { message: "Conversation title is required" })
        .max(200, { message: "Title must be at most 200 characters" }),
});

export { createConversationSchema };
