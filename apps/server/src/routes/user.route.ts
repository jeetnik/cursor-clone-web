import { Router } from "express";
import { loginUser, registerUser } from "../controllers/user.controllers";
const userRouter=Router();

userRouter.post('/auth/register',registerUser);
userRouter.post('/auth/login',loginUser)

export default userRouter;
