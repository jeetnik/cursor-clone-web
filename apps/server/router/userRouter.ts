import { Router } from "express";
const userRouter = Router();
import jwt from "jsonwebtoken";
import prisma from "db";
const JWT_SECRET = "mysecret";
import bcrypt from "bcrypt";
userRouter.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(403).json({
        message: "email and password is required",
      });
    }
    const isuser = await prisma.user.findUnique({
      where: { email },
    });
    if (isuser) {
      return res.status(403).json({
        message: "User is already exixts!",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: email,
        password: hashedPassword,
      },
    });
    res.status(200).json({
      message: "user is createad succesfully",
      userId: user.id,
    });
  } catch (e) {
    res.status(404).json({
      message: "Internal server error",
    });
  }
});

userRouter.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(403).json({
        message: "email and password is required",
      });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(403).json({
        message: "user not exits",
      });
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(403).json({ message: "Invalid password" });
    }
    const token = jwt.sign({ email: user.email, userId: user.id }, JWT_SECRET);
    res.status(200).json({
      message: "Signin successful",
      token: token,
    });
  } catch (e) {
    res.status(400).send({
      message: "Internal server error to signin",
    });
  }
});

export default userRouter;
