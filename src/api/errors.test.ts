import { normalizeApiError } from './errors';

describe('normalizeApiError', () => {
  it('normalizes the shared nested backend error envelope', () => {
    expect(
      normalizeApiError(409, {
        error: {
          code: 'TASK_DEPENDENCY_CYCLE',
          details: { taskId: 42 },
          message: 'This dependency would create a cycle.',
        },
      }),
    ).toEqual({
      code: 'TASK_DEPENDENCY_CYCLE',
      details: { taskId: 42 },
      message: 'This dependency would create a cycle.',
      status: 409,
    });
  });

  it('uses a safe message for an unknown response', () => {
    expect(normalizeApiError(500, null)).toEqual({
      code: null,
      details: null,
      message: 'Something went wrong. Please try again.',
      status: 500,
    });
  });
});
