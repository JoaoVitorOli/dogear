import type { FastifyError, FastifyInstance } from 'fastify';
import {
  hasZodFastifySchemaValidationErrors,
  isResponseSerializationError,
} from 'fastify-type-provider-zod';
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from '../errors/app-errors.js';

function isFastifyError(error: unknown): error is FastifyError {
  return error instanceof Error && 'statusCode' in error;
}

export function registerErrorHandler(app: FastifyInstance): void {
  app.setErrorHandler((error, request, reply) => {
    
    if (hasZodFastifySchemaValidationErrors(error)) {
      return reply.status(400).send({ message: 'Invalid request', issues: error.validation });
    }
    
    if (isResponseSerializationError(error)) {
      request.log.error(error, 'Response does not match schema');
      return reply.status(500).send({ message: 'Internal server error' });
    }

    if (error instanceof UnauthorizedError) {
      return reply.status(401).send({ message: error.message });
    }
    if (error instanceof ForbiddenError) {
      return reply.status(403).send({ message: error.message });
    }
    if (error instanceof NotFoundError) {
      return reply.status(404).send({ message: error.message });
    }
    if (error instanceof ConflictError) {
      return reply.status(409).send({ message: error.message });
    }

    if (isFastifyError(error) && error.statusCode !== undefined && error.statusCode < 500) {
      return reply.status(error.statusCode).send({ message: error.message });
    }

    request.log.error(error);
    return reply.status(500).send({ message: 'Internal server error' });
  });
}