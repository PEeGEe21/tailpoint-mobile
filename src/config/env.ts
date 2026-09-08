import { z } from 'zod';

const publicEnvironmentSchema = z
  .object({
    appEnvironment: z.enum(['development', 'preview', 'production']),
    apiUrl: z.url(),
  })
  .superRefine((value, context) => {
    if (
      value.appEnvironment === 'production' &&
      (!value.apiUrl.startsWith('https://') ||
        /localhost|127\.0\.0\.1|10\.0\.2\.2/.test(value.apiUrl))
    )
      context.addIssue({
        code: 'custom',
        path: ['apiUrl'],
        message: 'Production must use the HTTPS production API origin',
      });
  });

export function parsePublicEnvironment(
  source: Record<string, string | undefined>,
) {
  return publicEnvironmentSchema.parse({
    appEnvironment: source.EXPO_PUBLIC_APP_ENV ?? 'development',
    apiUrl: source.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000',
  });
}

export const environment = parsePublicEnvironment(process.env);
