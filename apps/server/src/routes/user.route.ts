import { Router } from "express";
import { loginUser } from "../controllers/user.controllers";
const userRouter=Router();

userRouter.post('auth/signup',loginUser);
