import { parsePublicEnvironment } from '@/config/env';

describe('public environment', () => {
  it('uses safe development defaults', () => {
    expect(parsePublicEnvironment({})).toEqual({
      apiUrl: 'http://localhost:3000',
      appEnvironment: 'development',
    });
  });

  it('rejects an invalid API URL', () => {
    expect(() =>
      parsePublicEnvironment({ EXPO_PUBLIC_API_URL: 'not-a-url' }),
    ).toThrow();
  });
});
