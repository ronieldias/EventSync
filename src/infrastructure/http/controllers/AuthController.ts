import { Request, Response } from "express";
import { hash, compare } from "bcryptjs";
import { sign } from "jsonwebtoken";
import { z } from "zod";
import { UserRepository } from "../../database/repositories/UserRepository";
import { AppError } from "../../../shared/errors/AppError";

const registerSchema = z.object({
  name: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["organizer", "participant"]).default("participant"),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export class AuthController {
  async register(req: Request, res: Response): Promise<Response> {
    const { name, email, password, role } = registerSchema.parse(req.body);

    const userRepository = new UserRepository();

    const userExists = await userRepository.findByEmail(email);
    if (userExists) {
      throw new AppError("Email already registered");
    }

    const hashedPassword = await hash(password, 10);

    const user = await userRepository.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    const { password: _, ...userWithoutPassword } = user;

    return res.status(201).json(userWithoutPassword);
  }

  async login(req: Request, res: Response): Promise<Response> {
    const { email, password } = loginSchema.parse(req.body);

    const userRepository = new UserRepository();

    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    const passwordMatch = await compare(password, user.password);
    if (!passwordMatch) {
      throw new AppError("Invalid credentials", 401);
    }

    const token = sign(
      { role: user.role },
      process.env.JWT_SECRET || "default-secret",
      {
        subject: user.id,
        expiresIn: process.env.JWT_EXPIRES_IN || "1d",
      }
    );

    const { password: _, ...userWithoutPassword } = user;

    return res.json({
      user: userWithoutPassword,
      token,
    });
  }
}
