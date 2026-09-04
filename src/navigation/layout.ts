export const LARGE_SCREEN_BREAKPOINT = 768;

export function getNavigationPlacement(width: number): 'bottom' | 'left' {
  return width >= LARGE_SCREEN_BREAKPOINT ? 'left' : 'bottom';
}
