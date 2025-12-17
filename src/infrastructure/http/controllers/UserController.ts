import { Request, Response } from "express";
import { z } from "zod";
import { hash, compare } from "bcryptjs";
import { UserRepository } from "../../database/repositories/UserRepository";
import { AppError } from "../../../shared/errors/AppError";

const updateUserSchema = z.object({
  name: z.string().min(3).optional(),
  email: z.string().email().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(6).optional(),
});

export class UserController {
  async index(_req: Request, res: Response): Promise<Response> {
    const userRepository = new UserRepository();
    const users = await userRepository.findAll();

    const usersWithoutPassword = users.map(({ password: _, ...user }) => user);

    return res.json(usersWithoutPassword);
  }

  async show(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;

    const userRepository = new UserRepository();
    const user = await userRepository.findById(id);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const { password: _, ...userWithoutPassword } = user;

    return res.json(userWithoutPassword);
  }

  async me(req: Request, res: Response): Promise<Response> {
    const userRepository = new UserRepository();
    const user = await userRepository.findById(req.userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const { password: _, ...userWithoutPassword } = user;

    return res.json(userWithoutPassword);
  }

  async update(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;
    const data = updateUserSchema.parse(req.body);

    if (req.userId !== id) {
      throw new AppError("You can only update your own profile", 403);
    }

    const userRepository = new UserRepository();
    const existingUser = await userRepository.findById(id);

    if (!existingUser) {
      throw new AppError("User not found", 404);
    }

    if (data.email) {
      const emailExists = await userRepository.findByEmail(data.email);
      if (emailExists && emailExists.id !== id) {
        throw new AppError("Email already in use");
      }
    }

    // Handle password change
    const updateData: { name?: string; email?: string; password?: string } = {};

    if (data.name) {
      updateData.name = data.name;
    }

    if (data.email) {
      updateData.email = data.email;
    }

    if (data.newPassword) {
      if (!data.currentPassword) {
        throw new AppError("Senha atual é obrigatória para alterar a senha", 400);
      }

      const passwordMatch = await compare(data.currentPassword, existingUser.password);
      if (!passwordMatch) {
        throw new AppError("Senha atual incorreta", 401);
      }

      updateData.password = await hash(data.newPassword, 10);
    }

    if (Object.keys(updateData).length === 0) {
      throw new AppError("Nenhum dado para atualizar", 400);
    }

    const user = await userRepository.update(id, updateData);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const { password: _, ...userWithoutPassword } = user;

    return res.json(userWithoutPassword);
  }

  async delete(req: Request, res: Response): Promise<Response> {
    const { id } = req.params;

    if (req.userId !== id) {
      throw new AppError("You can only delete your own account", 403);
    }

    const userRepository = new UserRepository();
    const deleted = await userRepository.delete(id);

    if (!deleted) {
      throw new AppError("User not found", 404);
    }

    return res.status(204).send();
  }
}
