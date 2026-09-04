import { resolveAppearance } from '@/hooks/use-theme';

describe('appearance resolution', () => {
  it.each([
    ['system', 'dark', 'dark'],
    ['system', 'light', 'light'],
    ['system', null, 'light'],
    ['dark', 'light', 'dark'],
    ['light', 'dark', 'light'],
  ] as const)(
    'resolves %s with system %s to %s',
    (preference, systemScheme, expected) => {
      expect(resolveAppearance(preference, systemScheme)).toBe(expected);
    },
  );
});
