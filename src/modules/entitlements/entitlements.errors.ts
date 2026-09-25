import { ConflictError } from '../../shared/errors/app-errors.js';

export class EntitlementAlreadyActiveError extends ConflictError {
  constructor() {
    super('This user already has an active entitlement from this partner');
  }
}

export class EntitlementConflictError extends ConflictError {
  constructor() {
    super('externalCustomerId is already linked to another user');
  }
}