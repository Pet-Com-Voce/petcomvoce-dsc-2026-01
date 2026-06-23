import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Thrown when a domain business rule is violated.
 * Maps to HTTP 422 Unprocessable Entity.
 */
export class BusinessRuleViolationException extends HttpException {
  constructor(message: string, details?: Record<string, unknown>) {
    super(
      {
        error: 'BUSINESS_RULE_VIOLATION',
        message,
        ...(details && { details }),
      },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}

/**
 * Thrown when a requested resource does not exist.
 * Maps to HTTP 404 Not Found.
 */
export class ResourceNotFoundException extends HttpException {
  constructor(resource: string, id?: string | number) {
    super(
      {
        error: 'NOT_FOUND',
        message: id
          ? `${resource} com ID "${id}" não encontrado`
          : `${resource} não encontrado`,
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

/**
 * Thrown when a scheduling conflict is detected.
 * Maps to HTTP 409 Conflict.
 */
export class SchedulingConflictException extends HttpException {
  constructor(message: string, details?: Record<string, unknown>) {
    super(
      {
        error: 'SCHEDULING_CONFLICT',
        message,
        ...(details && { details }),
      },
      HttpStatus.CONFLICT,
    );
  }
}

/**
 * Thrown when the request is not authorized.
 * Maps to HTTP 401 Unauthorized.
 */
export class UnauthorizedException extends HttpException {
  constructor(message = 'Não autorizado') {
    super(
      {
        error: 'UNAUTHORIZED',
        message,
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}
