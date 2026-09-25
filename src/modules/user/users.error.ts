import { NotFoundError } from '../../shared/errors/app-errors.js';

export class UserNotFoundError extends NotFoundError {
  constructor() {
    super('User not found');
  }
}