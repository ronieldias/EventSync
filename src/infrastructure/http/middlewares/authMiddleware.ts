import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";
import { AppError } from "../../../shared/errors/AppError";

interface TokenPayload {
  sub: string;
  role: string;
  iat: number;
  exp: number;
}

declare global {
  namespace Express {
    interface Request {
      userId: string;
      userRole: string;
    }
  }
}

export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError("Token not provided", 401);
  }

  const [, token] = authHeader.split(" ");

  try {
    const decoded = verify(
      token,
      process.env.JWT_SECRET || "default-secret"
    ) as TokenPayload;

    req.userId = decoded.sub;
    req.userRole = decoded.role;

    return next();
  } catch {
    throw new AppError("Invalid token", 401);
  }
}
