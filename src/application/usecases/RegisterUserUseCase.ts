import { User, UserRole } from "../../domain/entities/User";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { hashPassword } from "../../shared/utils/hash";

interface IRequest {
  nome: string;
  email: string;
  senha: string;
  cidade: string;
  role?: UserRole;
}

export class RegisterUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute({ nome, email, senha, cidade, role }: IRequest): Promise<User> {
    const userAlreadyExists = await this.userRepository.findByEmail(email);

    if (userAlreadyExists) {
      throw new Error("User already exists");
    }

    const passwordHash = await hashPassword(senha);

    const user = new User();
    Object.assign(user, {
      nome,
      email,
      senha_hash: passwordHash,
      cidade,
      role: role || UserRole.USER,
    });

    return this.userRepository.create(user);
  }
}