import { sign, verify } from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "default_secret";

export const generateToken = (payload: object): string => {
  return sign(payload, SECRET, { expiresIn: "1d" });
};

export const verifyToken = (token: string): any => {
  return verify(token, SECRET);
};