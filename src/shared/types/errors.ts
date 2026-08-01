export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string = 'APP_ERROR',
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class AuthError extends AppError {
  constructor(message: string, code: string = 'AUTH_ERROR') {
    super(message, code);
    this.name = 'AuthError';
  }
}
