import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface UserPayload {
  email: string;
  userId: string;
}

declare global {
  namespace Express {
    interface Request {
      user: UserPayload;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET!;

export function auth(req: Request, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(403).json({
        message: "Authorization header missing"
      });
    }


    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(403).json({
        message: "Token missing"
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;

    req.user = {
      email: decoded.email,
      userId: decoded.userId
    };

    next(); 

  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
}
