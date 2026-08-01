import type {
  AuthRepository,
  LoginCredentials,
} from '../repositories/AuthRepository';
import type { AuthSession } from '../entities/User';

export class LoginUseCase {
  constructor(private readonly repository: AuthRepository) {}

  execute(credentials: LoginCredentials): Promise<AuthSession> {
    return this.repository.login(credentials);
  }
}
