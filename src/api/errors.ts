export interface ApiErrorDetails {
  [key: string]: unknown;
}

export interface NormalizedApiError {
  code: string | null;
  details: ApiErrorDetails | null;
  message: string;
  status: number;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export function normalizeApiError(
  status: number,
  error: unknown,
): NormalizedApiError {
  if (!isRecord(error)) {
    return {
      code: null,
      details: null,
      message: 'Something went wrong. Please try again.',
      status,
    };
  }

  const nestedError = isRecord(error.error) ? error.error : null;
  const messageValue = nestedError?.message ?? error.message;
  const message = Array.isArray(messageValue)
    ? messageValue
        .filter((item): item is string => typeof item === 'string')
        .join(', ')
    : typeof messageValue === 'string'
      ? messageValue
      : 'Something went wrong. Please try again.';

  return {
    code:
      typeof nestedError?.code === 'string'
        ? nestedError.code
        : typeof error.code === 'string'
          ? error.code
          : null,
    details: isRecord(nestedError?.details)
      ? nestedError.details
      : isRecord(error.details)
        ? error.details
        : null,
    message,
    status,
  };
}
