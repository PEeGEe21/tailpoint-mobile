const deniedKey =
  /authorization|cookie|password|secret|token|content|description|comment/i;

export type TelemetryValue = boolean | number | string | null;
export type TelemetryContext = Record<string, TelemetryValue | undefined>;

export function sanitizeTelemetryContext(context: TelemetryContext) {
  return Object.fromEntries(
    Object.entries(context)
      .filter(([key, value]) => !deniedKey.test(key) && value !== undefined)
      .map(([key, value]) => [
        key,
        typeof value === 'string' ? value.slice(0, 256) : value,
      ]),
  );
}

export interface Telemetry {
  captureError(error: unknown, context?: TelemetryContext): void;
  track(name: string, context?: TelemetryContext): void;
}

export const telemetry: Telemetry = {
  captureError: () => undefined,
  track: () => undefined,
};
