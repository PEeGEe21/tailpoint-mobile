import { sanitizeTelemetryContext } from '@/telemetry/telemetry';

describe('telemetry sanitizer', () => {
  it('removes denied values and bounds strings', () => {
    const result = sanitizeTelemetryContext({
      operation: 'task.list',
      refreshToken: 'never-log-me',
      taskDescription: 'private content',
      requestId: 'x'.repeat(300),
    });

    expect(result).toEqual({
      operation: 'task.list',
      requestId: 'x'.repeat(256),
    });
  });
});
