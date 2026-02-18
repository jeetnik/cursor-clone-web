import type { Request, Response } from "express";
import { loginSchema, registerSchema } from "../utils/validators/user.validators";
import prisma from "db";
import  jwt  from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

const registerUser = async (req: Request, res: Response) => {
  // try {
    const { email, password } = registerSchema.parse(req.body);
    const existingUser = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (existingUser) {
      return res.json(409).json({
        error: "User already exits",
      });
    }
    const user = await prisma.user.create({
      data: {
        email: email,
        password: password,
      },
    });

    res
      .status(200)
      .json({ message: `User created Successfully with id ${user.id}` });
  // } catch (error) {
  //   if (error instanceof Error && error.name === "ZodError") {
  //     return res.status(400).json({
  //       message: "Invalid input",
  //       error: error,
  //     });
  //   }
  //   res.status(500).json({ error: "Internal server error" });
  // }
  }
const loginUser=async(req:Request,res:Response)=>{
  try{
  const {email,password}=loginSchema.parse(req.body);
  const user=await prisma.user.findUnique({
    where:{
      email:email
    }
  })
  if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
 let isValid=user.password===password;
 if(!isValid){
  return res.status(401).json({
error: "Invalid credentials"
  })
 }
  const token=jwt.sign({email:email},JWT_SECRET,{
    expiresIn:"7d"
  })
res.status(200).json({
  "message":"User login successful",
  token:token
})
  }catch(error){
     if(error instanceof Error && error.name==="ZodError"){
      return res.status(400).json({
        message:"Invalid Input"
      })
     }
     res.status(500).json({
      message:"Internal server error"
     })
  }

}

export {loginUser,registerUser}