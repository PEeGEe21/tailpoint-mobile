import { Colors } from '@/constants/theme';
import { contrastRatio } from '@/design/contrast';

describe.each(['light', 'dark'] as const)('%s theme contrast', (scheme) => {
  const theme = Colors[scheme];
  it('meets AA for primary text', () =>
    expect(contrastRatio(theme.text, theme.background)).toBeGreaterThanOrEqual(
      4.5,
    ));
  it('meets AA for muted text', () =>
    expect(
      contrastRatio(theme.textSecondary, theme.background),
    ).toBeGreaterThanOrEqual(4.5));
});
