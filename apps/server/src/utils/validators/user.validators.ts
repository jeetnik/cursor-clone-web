import { z } from "zod";

const loginSchema = z.object({
  email: z.email({ message: "Invalid email" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" })
    .max(16, { message: "Password must be at most 16 characters long" })
});

const registerSchema = z.object({
  email: z.email({ message: "Invalid email" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" })
    .max(16, { message: "Password must be at most 16 characters long" })
});


export {loginSchema,registerSchema}

