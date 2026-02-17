import { email, z } from "zod";

const loginSchema = z.object({
  email: z.email({ message: "Invalid email" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" })
    .max(16, { message: "Password must be at most 16 characters long" })
    .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{6,}$/, {
        message:
            "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.",
    }),
    name:z.string().optional(),
});
type LoginData = z.infer<typeof loginSchema>;
const validateLoginData=(data:LoginData)=>{
  return loginSchema.safeParse(data);

}

export {validateLoginData}