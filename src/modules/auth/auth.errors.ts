import { UnauthorizedError } from '../../shared/errors/app-errors.js';

export class InvalidCredentialsError extends UnauthorizedError {
  constructor() {
    super('Invalid credentials');
  }
}