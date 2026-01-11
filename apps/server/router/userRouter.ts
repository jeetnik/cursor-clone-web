import { Router } from "express";
const userRouter=Router();
import prisma from "db"
userRouter.post("/signup",async (req,res)=>{
    const {email,password}=req.body;
    if(!email||!password){
        return res.status(403).json({
            message:"email and password is required"
        })
    }
    const isuser=await prisma.user.findUnique({
        where:{email}
    })
    if(isuser){
        return res.status(403).json({
            message:"User is already exixts!"
        })
    }

    const user=await prisma.user.create({
        data:{
            email:email,
            password:password
        }
    })
    res.status(200).json({
        message:"user is createad succesfully",
        userId:user.id
    })

})

export default userRouter;