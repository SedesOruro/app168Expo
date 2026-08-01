import type { AuthRepository } from '../repositories/AuthRepository';

export class LogoutUseCase {
  constructor(private readonly repository: AuthRepository) {}

  execute(refreshToken?: string | null): Promise<void> {
    return this.repository.logout(refreshToken);
  }
}
