/**
 * Thrown when the request is valid HTTP but not allowed by the business rules
 * (for example: updating a task that does not exist).
 */
export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

/** Thrown when the client sends invalid input (handled as HTTP 400). */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

/** Thrown when login details are wrong or a token is missing/invalid (401). */
export class UnauthorizedError extends Error {
  constructor(message = 'Invalid email or password.') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

/** Thrown when a signed-in user tries to use something they do not own (403). */
export class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ForbiddenError';
  }
}