export enum ErrorCodes {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  BAD_REQUEST = "BAD_REQUEST", 
  INTERNAL_ERROR = "INTERNAL_ERROR",
  SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
  NOT_FOUND = "NOT_FOUND"
}

export interface ApiError {
  code: ErrorCodes;
  message: string;
  details?: any;
}

export function createApiError(code: ErrorCodes, message: string, details?: any): ApiError {
  return { code, message, details };
}
