import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export interface AuthRequest extends Request {
    userId?: string;
    userEmail?: string;
}

const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ error: "Unauthorized: No token provided" });
        return;
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token!, JWT_SECRET) as unknown as { email: string };
        req.userEmail = decoded.email;
        next();
    } catch (error) {
        res.status(401).json({ error: "Unauthorized: Invalid token" });
        return;
    }
};

export { authMiddleware };
