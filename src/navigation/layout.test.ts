import {
  getNavigationPlacement,
  LARGE_SCREEN_BREAKPOINT,
} from '@/navigation/layout';

describe('responsive navigation placement', () => {
  it('uses bottom tabs on phones', () => {
    expect(getNavigationPlacement(390)).toBe('bottom');
    expect(getNavigationPlacement(LARGE_SCREEN_BREAKPOINT - 1)).toBe('bottom');
  });

  it('uses a side rail on tablets', () => {
    expect(getNavigationPlacement(LARGE_SCREEN_BREAKPOINT)).toBe('left');
    expect(getNavigationPlacement(1024)).toBe('left');
  });
});
