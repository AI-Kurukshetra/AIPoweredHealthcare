export type ApiSuccess<T> = { data: T; error: null };

export type ApiError = {
  data: null;
  error: {
    code:
      | "UNAUTHORIZED"
      | "FORBIDDEN"
      | "NOT_FOUND"
      | "VALIDATION_ERROR"
      | "INTERNAL_ERROR";
    message: string;
    details?: Record<string, string[]>;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
