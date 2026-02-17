import type { Response,Request } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import {validateLoginData } from "../utils/validators/user.validators";
export const loginUser=asyncHandler(async(req:Request,res:Response)=>{
    const {email,password}=validateLoginData(req.body);

})