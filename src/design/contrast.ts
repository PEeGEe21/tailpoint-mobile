function channel(value: number) {
  const normalized = value / 255;
  return normalized <= 0.04045
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}
export function contrastRatio(foreground: string, background: string) {
  const parse = (hex: string) =>
    [1, 3, 5].map((index) =>
      channel(Number.parseInt(hex.slice(index, index + 2), 16)),
    );
  const luminance = (hex: string) => {
    const [r, g, b] = parse(hex);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const first = luminance(foreground);
  const second = luminance(background);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}
