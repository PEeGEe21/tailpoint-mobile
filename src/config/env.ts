import { z } from 'zod';

const publicEnvironmentSchema = z.object({
  appEnvironment: z.enum(['development', 'preview', 'production']),
  apiUrl: z.url(),
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
