import { hash, compare } from "bcryptjs";

export const hashPassword = async (password: string): Promise<string> => {
  return hash(password, 8);
};

export const comparePassword = async (payload: string, hashed: string): Promise<boolean> => {
  return compare(payload, hashed);
};