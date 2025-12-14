import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { comparePassword } from "../../shared/utils/hash";
import { generateToken } from "../../shared/utils/jwt";

interface IRequest {
  email: string;
  senha: string;
}

export class LoginUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute({ email, senha }: IRequest) {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new Error("Email or password incorrect");
    }

    const passwordMatch = await comparePassword(senha, user.senha_hash);

    if (!passwordMatch) {
      throw new Error("Email or password incorrect");
    }

    const token = generateToken({ id: user.id });

    return {
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }
}