import type { AuthSession } from '../entities/User';
import type { AuthRepository } from '../repositories/AuthRepository';

export class RefreshTokenUseCase {
  constructor(private readonly repository: AuthRepository) {}

  execute(refreshToken: string): Promise<AuthSession> {
    return this.repository.refreshToken(refreshToken);
  }
}
