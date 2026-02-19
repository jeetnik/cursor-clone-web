import type { Request, Response, NextFunction } from "express";

type AsyncRequestHandler = (
    req: Request,
    res: Response,
    next: NextFunction
) => Promise<any>;

const asyncHandler =
    (fn: AsyncRequestHandler) => (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch((error) => {
            if (error instanceof Error && error.name === "ZodError") {
                return res.status(400).json({
                    message: "Invalid input",
                    error: error,
                });
            }
            res.status(500).json({ message: "Internal server error" });
        });
    };

export { asyncHandler };
