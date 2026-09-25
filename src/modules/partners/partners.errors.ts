import { ConflictError, NotFoundError } from '../../shared/errors/app-errors.js';

export class PartnerNotFoundError extends NotFoundError {
  constructor() {
    super('Partner not found');
  }
}

export class PartnerNameTakenError extends ConflictError {
  constructor() {
    super('A partner with this name already exists');
  }
}