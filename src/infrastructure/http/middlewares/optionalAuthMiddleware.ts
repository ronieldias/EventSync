import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";

interface TokenPayload {
  sub: string;
  role: string;
  iat: number;
  exp: number;
}

export function optionalAuthMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next();
  }

  const [, token] = authHeader.split(" ");

  try {
    const decoded = verify(
      token,
      process.env.JWT_SECRET || "default-secret"
    ) as TokenPayload;

    req.userId = decoded.sub;
  } catch {
    // Token inválido, mas continua sem autenticação
  }

  return next();
}
