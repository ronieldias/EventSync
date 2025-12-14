import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../../shared/utils/jwt";

// Interface estendida para incluir o usuário
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
  };
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ error: "Token is missing" });
    return;
  }

  // Formato esperado: "Bearer <token>"
  const [, token] = authHeader.split(" ");

  try {
    const decoded = verifyToken(token);
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};