import { IUserRepository } from "../../domain/repositories/IUserRepository";

export class GetUserProfileUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string) {
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw new Error("Usuário não encontrado.");
    }

    // Retorna dados do perfil (sem a senha)
    return {
      id: user.id,
      nome: user.nome,
      email: user.email,
      cidade: user.cidade,
      role: user.role,
      bio: user.bio,
      foto_url: user.foto_url,
      visibilidade_participacao: user.visibilidade_participacao,
      created_at: user.created_at
    };
  }
}