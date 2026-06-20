export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = hex.replace('#', '')
  const value =
    normalized.length === 3
      ? normalized
          .split('')
          .map((c) => c + c)
          .join('')
      : normalized

  const num = parseInt(value, 16)
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  }
}

export function lightenRgb(
  rgb: { r: number; g: number; b: number },
  amount: number,
): { r: number; g: number; b: number } {
  return {
    r: Math.min(255, Math.round(rgb.r + (255 - rgb.r) * amount)),
    g: Math.min(255, Math.round(rgb.g + (255 - rgb.g) * amount)),
    b: Math.min(255, Math.round(rgb.b + (255 - rgb.b) * amount)),
  }
}
