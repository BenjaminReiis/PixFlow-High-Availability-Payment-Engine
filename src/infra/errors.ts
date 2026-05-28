export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400,
    public details?: unknown
  ) {
    super(message);
  }
}

export const Errors = {
  unauthorized: (msg = "Unauthorized") => new AppError("UNAUTHORIZED", msg, 401),
  forbidden: (msg = "Forbidden") => new AppError("FORBIDDEN", msg, 403),
  notFound: (msg = "Not found") => new AppError("NOT_FOUND", msg, 404),
  conflict: (msg = "Conflict") => new AppError("CONFLICT", msg, 409),
  badRequest: (msg = "Bad request", details?: unknown) => new AppError("BAD_REQUEST", msg, 400, details),
  internal: (msg = "Internal error", details?: unknown) => new AppError("INTERNAL", msg, 500, details)
};
