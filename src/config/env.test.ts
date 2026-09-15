import { parsePublicEnvironment } from '@/config/env';

describe('public environment', () => {
  it('uses safe development defaults', () => {
    expect(parsePublicEnvironment({})).toEqual({
      apiUrl: 'http://localhost:5000',
      appEnvironment: 'development',
    });
  });

  it('rejects an invalid API URL', () => {
    expect(() =>
      parsePublicEnvironment({ EXPO_PUBLIC_API_URL: 'not-a-url' }),
    ).toThrow();
  });

  it('rejects a local or insecure production backend', () => {
    expect(() =>
      parsePublicEnvironment({
        EXPO_PUBLIC_APP_ENV: 'production',
        EXPO_PUBLIC_API_URL: 'http://localhost:3000',
      }),
    ).toThrow();
  });
});
