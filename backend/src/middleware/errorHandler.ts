import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { logger } from '../utils/logger';
import { ValidationError, AuthenticationError, AuthorizationError, RateLimitError } from '../types';

export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
): void {
  logger.error('Request error:', {
    error: error.message,
    stack: error.stack,
    url: request.url,
    method: request.method,
    ip: request.ip,
  });

  // Handle specific error types
  if (error instanceof ValidationError) {
    reply.code(400).send({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: error.message,
        details: { field: error.field },
      },
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (error instanceof AuthenticationError) {
    reply.code(401).send({
      success: false,
      error: {
        code: 'AUTHENTICATION_ERROR',
        message: error.message,
      },
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (error instanceof AuthorizationError) {
    reply.code(403).send({
      success: false,
      error: {
        code: 'AUTHORIZATION_ERROR',
        message: error.message,
      },
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (error instanceof RateLimitError) {
    reply.code(429).send({
      success: false,
      error: {
        code: 'RATE_LIMIT_ERROR',
        message: error.message,
      },
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Handle Fastify validation errors
  if (error.validation) {
    reply.code(400).send({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: error.validation,
      },
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // Default server error
  reply.code(500).send({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    },
    timestamp: new Date().toISOString(),
  });
}