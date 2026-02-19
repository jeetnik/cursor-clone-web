import type { Request, Response } from "express";
import { loginSchema, registerSchema } from "../utils/validators/user.validators";
import prisma from "db";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { asyncHandler } from "../utils/asyncHandler";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

const registerUser = asyncHandler(async (req: Request, res: Response) => {

  const { email, password } = registerSchema.parse(req.body);
  const existingUser = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
  if (existingUser) {
    return res.status(409).json({
      error: "User already exits",
    });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email: email,
      password: hashedPassword,
    },
  });

  res
    .status(200)
    .json({ message: `User created Successfully with id ${user.id}` });
});

const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = loginSchema.parse(req.body);
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
  if (!user) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }
  const isValid = await bcrypt.compare(password, user.password || "");
  if (!isValid) {
    return res.status(401).json({
      error: "Invalid credentials",
    });
  }
  const token = jwt.sign({ email: email }, JWT_SECRET, {
    expiresIn: "7d",
  });
  res.status(200).json({
    message: "User login successful",
    token: token,
  });
});

export { loginUser, registerUser };