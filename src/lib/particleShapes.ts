export type ShapeType =
  | 'plusCorners'
  | 'plusMerged'
  | 'xShape'
  | 'human'
  | 'emptySquare'
  | 'scatter'

export interface ShapePoint {
  x: number
  y: number
  size: number
}

function seededRandom(seed: number) {
  const x = Math.sin(seed * 12.9898 + seed * 78.233) * 43758.5453
  return x - Math.floor(x)
}

function distribute(count: number, points: ShapePoint[], seedBase = 0): ShapePoint[] {
  if (points.length === 0) return []
  const result: ShapePoint[] = []
  const perPoint = Math.max(1, Math.floor(count / points.length))
  let idx = 0

  for (const pt of points) {
    for (let i = 0; i < perPoint; i++) {
      const seed = seedBase + idx * 17.31
      const jitter = 4 + seededRandom(seed) * 6
      result.push({
        x: pt.x + (seededRandom(seed + 1) - 0.5) * jitter,
        y: pt.y + (seededRandom(seed + 2) - 0.5) * jitter,
        size: pt.size * (0.85 + seededRandom(seed + 3) * 0.3),
      })
      idx++
    }
  }

  while (result.length < count) {
    const pt = points[result.length % points.length]
    const seed = seedBase + idx * 17.31
    result.push({
      x: pt.x + (seededRandom(seed + 4) - 0.5) * 8,
      y: pt.y + (seededRandom(seed + 5) - 0.5) * 8,
      size: pt.size * (0.8 + seededRandom(seed + 6) * 0.4),
    })
    idx++
  }

  return result.slice(0, count)
}

export function getScatterPoints(
  count: number,
  region: { x: number; y: number; w: number; h: number },
  baseSize: number,
  seed = 42,
): ShapePoint[] {
  const cols = Math.ceil(Math.sqrt(count * (region.w / region.h)))
  const rows = Math.ceil(count / cols)
  const cellW = region.w / cols
  const cellH = region.h / rows

  return Array.from({ length: count }, (_, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    const s = seed + i * 13.7
    const x =
      region.x +
      col * cellW +
      cellW * 0.5 +
      (seededRandom(s) - 0.5) * cellW * 0.75
    const y =
      region.y +
      row * cellH +
      cellH * 0.5 +
      (seededRandom(s + 1) - 0.5) * cellH * 0.75
    const sizeRatio = 0.75 + seededRandom(s + 2) * 0.5

    return {
      x,
      y,
      size: baseSize * sizeRatio,
    }
  })
}

export function getShapePoints(
  shape: ShapeType,
  cx: number,
  cy: number,
  scale: number,
  count: number,
  width?: number,
  height?: number,
  seedBase = 1000,
): ShapePoint[] {
  const r = 28 * scale
  const s = 10 * scale
  const big = 16 * scale

  switch (shape) {
    case 'plusCorners': {
      const cornerDist = r * 1.55
      const corners = [
        { x: cx - cornerDist, y: cy - cornerDist, size: s * 1.05 },
        { x: cx + cornerDist, y: cy - cornerDist, size: s * 1.05 },
        { x: cx - cornerDist, y: cy + cornerDist, size: s * 1.05 },
        { x: cx + cornerDist, y: cy + cornerDist, size: s * 1.05 },
      ]
      const core = [
        { x: cx, y: cy, size: big * 1.15 },
        { x: cx, y: cy - r, size: s },
        { x: cx, y: cy + r, size: s },
        { x: cx - r, y: cy, size: s },
        { x: cx + r, y: cy, size: s },
        { x: cx, y: cy - r * 0.5, size: s * 0.85 },
        { x: cx, y: cy + r * 0.5, size: s * 0.85 },
        { x: cx - r * 0.5, y: cy, size: s * 0.85 },
        { x: cx + r * 0.5, y: cy, size: s * 0.85 },
      ]
      return distribute(count, [...core, ...corners], seedBase)
    }

    case 'plusMerged': {
      const pts = [
        { x: cx, y: cy, size: big * 1.2 },
        { x: cx, y: cy - r * 0.9, size: s * 1.1 },
        { x: cx, y: cy + r * 0.9, size: s * 1.1 },
        { x: cx - r * 0.9, y: cy, size: s * 1.1 },
        { x: cx + r * 0.9, y: cy, size: s * 1.1 },
        { x: cx, y: cy - r * 0.45, size: s * 0.9 },
        { x: cx, y: cy + r * 0.45, size: s * 0.9 },
        { x: cx - r * 0.45, y: cy, size: s * 0.9 },
        { x: cx + r * 0.45, y: cy, size: s * 0.9 },
      ]
      return distribute(count, pts, seedBase)
    }

    case 'xShape': {
      const d = r * 0.75
      const pts = [
        { x: cx, y: cy, size: big },
        { x: cx - d, y: cy - d, size: s },
        { x: cx + d, y: cy - d, size: s },
        { x: cx - d, y: cy + d, size: s },
        { x: cx + d, y: cy + d, size: s },
        { x: cx, y: cy - d * 0.5, size: s * 0.85 },
        { x: cx, y: cy + d * 0.5, size: s * 0.85 },
        { x: cx - d * 0.5, y: cy, size: s * 0.85 },
        { x: cx + d * 0.5, y: cy, size: s * 0.85 },
      ]
      return distribute(count, pts, seedBase)
    }

    case 'human': {
      const pts = [
        { x: cx, y: cy - r * 1.1, size: s * 1.1 },
        { x: cx, y: cy - r * 0.3, size: s * 1.3 },
        { x: cx, y: cy + r * 0.5, size: s * 1.2 },
        { x: cx - r * 0.7, y: cy - r * 0.2, size: s * 0.9 },
        { x: cx + r * 0.7, y: cy - r * 0.2, size: s * 0.9 },
        { x: cx - r * 0.5, y: cy + r * 1.1, size: s * 0.85 },
        { x: cx + r * 0.5, y: cy + r * 1.1, size: s * 0.85 },
        { x: cx, y: cy + r * 1.3, size: s * 0.7 },
      ]
      return distribute(count, pts, seedBase)
    }

    case 'emptySquare': {
      const half = r * 1.1
      const pts = [
        { x: cx - half, y: cy - half, size: s },
        { x: cx, y: cy - half, size: s * 0.8 },
        { x: cx + half, y: cy - half, size: s },
        { x: cx + half, y: cy, size: s * 0.8 },
        { x: cx + half, y: cy + half, size: s },
        { x: cx, y: cy + half, size: s * 0.8 },
        { x: cx - half, y: cy + half, size: s },
        { x: cx - half, y: cy, size: s * 0.8 },
      ]
      return distribute(count, pts, seedBase)
    }

    case 'scatter': {
      const w = width ?? r * 4
      const h = height ?? r * 4
      const ptSize = 10 * scale
      return Array.from({ length: count }, (_, i) => {
        const seed = seedBase + i * 9.1
        return {
          x: cx - w / 2 + seededRandom(seed) * w,
          y: cy - h / 2 + seededRandom(seed + 1) * h,
          size: ptSize * (0.7 + seededRandom(seed + 2) * 0.6),
        }
      })
    }
  }
}

export function blendShapePoints(
  a: ShapePoint[],
  b: ShapePoint[],
  t: number,
): ShapePoint[] {
  const len = Math.max(a.length, b.length)
  const result: ShapePoint[] = []

  for (let i = 0; i < len; i++) {
    const pa = a[i % a.length]
    const pb = b[i % b.length]
    result.push({
      x: pa.x + (pb.x - pa.x) * t,
      y: pa.y + (pb.y - pa.y) * t,
      size: pa.size + (pb.size - pa.size) * t,
    })
  }

  return result
}
