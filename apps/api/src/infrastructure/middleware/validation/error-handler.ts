export enum ErrorCodes { VALIDATION_ERROR = "VALIDATION_ERROR" }
export function createApiError(code: ErrorCodes, message: string) { return { code, message }; }
