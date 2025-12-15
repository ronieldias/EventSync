import { IUserRepository } from "../../domain/repositories/IUserRepository";

interface IRequest {
  userId: string;
  nome?: string;
  cidade?: string;
  bio?: string;
  foto_url?: string;
  visibilidade_participacao?: boolean;
}

export class UpdateUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute({ userId, ...updates }: IRequest) {
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw new Error("Usuário não encontrado.");
    }

    // Atualiza apenas os campos enviados, mantendo os antigos se não enviados
    Object.assign(user, updates);

    return this.userRepository.create(user); // O create/save do TypeORM atualiza se o ID já existir
  }
}