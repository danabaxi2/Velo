import { getFlowVector, getTurbulence } from './flowField'
import { drawSphere } from './particleDraw'
import type { ShapePoint } from './particleShapes'

export const PARTICLE_COLOR = '#00FFA1'
export const ATTRACT_RADIUS = 150

export type ParticleMode = 'ambient' | 'shape' | 'chaotic'

export interface EngineParticle {
  x: number
  y: number
  targetX: number
  targetY: number
  size: number
  sizeRatio: number
  phase: number
  homeX: number
  homeY: number
}

export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function wrapInRegion(value: number, min: number, max: number) {
  const range = max - min
  if (range <= 0) return min
  if (value < min) return max - ((min - value) % range)
  if (value > max) return min + ((value - max) % range)
  return value
}

export function constrainRegion(
  p: EngineParticle,
  region: { x: number; y: number; w: number; h: number },
  hard: boolean,
) {
  const minX = region.x
  const maxX = region.x + region.w
  const minY = region.y
  const maxY = region.y + region.h

  if (hard) {
    p.x = clamp(p.x, minX, maxX)
    p.y = clamp(p.y, minY, maxY)
  } else {
    p.x = wrapInRegion(p.x, minX, maxX)
    p.y = wrapInRegion(p.y, minY, maxY)
  }
}

export function createParticlesFromScatter(
  scatterPoints: ShapePoint[],
  baseSize: number,
): EngineParticle[] {
  return scatterPoints.map((pt, i) => {
    const sizeRatio = pt.size / baseSize
    return {
      x: pt.x,
      y: pt.y,
      targetX: pt.x,
      targetY: pt.y,
      homeX: pt.x,
      homeY: pt.y,
      size: pt.size,
      sizeRatio,
      phase: (i * 0.618) % (Math.PI * 2),
    }
  })
}

export function assignBlendedTargets(
  particles: EngineParticle[],
  scatterPoints: ShapePoint[],
  shapePoints: ShapePoint[],
  t: number,
  baseSize: number,
) {
  particles.forEach((p, i) => {
    const scatter = scatterPoints[i % scatterPoints.length]
    const shape = shapePoints[i % shapePoints.length]
    p.targetX = lerp(scatter.x, shape.x, t)
    p.targetY = lerp(scatter.y, shape.y, t)
    p.size = lerp(scatter.size, shape.size, t) || baseSize * p.sizeRatio
  })
}

export function assignShapeTargets(
  particles: EngineParticle[],
  shapePoints: ShapePoint[],
  baseSize: number,
) {
  particles.forEach((p, i) => {
    const pt = shapePoints[i % shapePoints.length]
    p.targetX = pt.x
    p.targetY = pt.y
    p.size = pt.size || baseSize * p.sizeRatio
  })
}

interface UpdateOptions {
  mode: ParticleMode
  shapeBlend: number
  morphProgress?: number
  flowStrength?: number
  region: { x: number; y: number; w: number; h: number }
  fullRegion: { x: number; y: number; w: number; h: number }
  scatterRegion?: { x: number; y: number; w: number; h: number }
  disableMouseAboveBlend?: number
  reducedMotion?: boolean
}

interface MouseLocal {
  x: number
  y: number
  active: boolean
}

export function updateParticles(
  particles: EngineParticle[],
  time: number,
  mouse: MouseLocal,
  opts: UpdateOptions,
) {
  const {
    mode,
    shapeBlend,
    morphProgress = 0,
    flowStrength = 0.25,
    fullRegion,
    scatterRegion,
    disableMouseAboveBlend = 0.15,
    reducedMotion = false,
  } = opts

  const morph = Math.max(shapeBlend, morphProgress)
  const isMorphing = morphProgress > 0
  const mouseEnabled =
    mouse.active && (!isMorphing || morphProgress <= disableMouseAboveBlend)

  if (reducedMotion && morph >= 1) {
    for (const p of particles) {
      p.x = lerp(p.x, p.targetX, 0.2)
      p.y = lerp(p.y, p.targetY, 0.2)
    }
    return
  }

  const isChaotic = mode === 'chaotic'
  const useShapePull = isMorphing ? morphProgress > 0.05 : mode === 'shape' && shapeBlend > 0
  const pullStrength = isMorphing
    ? 0.04 + morphProgress * 0.08
    : isChaotic
      ? 0.04
      : 0.06 + shapeBlend * 0.14

  const ambientWeight = isMorphing
    ? Math.max(0, 1 - morphProgress * 1.2)
    : isChaotic
      ? 1
      : Math.max(0, 1 - shapeBlend * 0.85)

  const strength = isChaotic ? flowStrength * 2.2 : flowStrength
  const constrainHard = isMorphing && morphProgress < 0.35
  const activeRegion =
    constrainHard && scatterRegion ? scatterRegion : fullRegion

  for (const p of particles) {
    if (useShapePull) {
      p.x = lerp(p.x, p.targetX, pullStrength)
      p.y = lerp(p.y, p.targetY, pullStrength)

      if (morphProgress >= 0.95) {
        p.x += Math.sin(time * 0.001 + p.phase) * 0.15
        p.y += Math.cos(time * 0.0008 + p.phase) * 0.15
      } else if (!isChaotic && morph < 1) {
        p.x += Math.sin(time * 0.001 + p.phase) * (1 - morph) * 0.3
        p.y += Math.cos(time * 0.0008 + p.phase) * (1 - morph) * 0.3
      }
    }

    if (ambientWeight > 0.05) {
      const flow = getFlowVector(p.x, p.y, time, strength)
      const turb = getTurbulence(p.x, p.y, time, p.phase)

      p.x += (flow.vx * 0.4 + turb.tx * 0.6) * ambientWeight
      p.y += (flow.vy * 0.4 + turb.ty * 0.6) * ambientWeight
      p.x += Math.sin(time * 0.001 + p.phase) * 0.25 * ambientWeight
      p.y += Math.cos(time * 0.0008 + p.phase) * 0.25 * ambientWeight
    }

    if (mouseEnabled && (isChaotic || mode === 'ambient' || morph < disableMouseAboveBlend)) {
      const dx = mouse.x - p.x
      const dy = mouse.y - p.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < ATTRACT_RADIUS) {
        const pull = (1 - dist / ATTRACT_RADIUS) ** 2 * (isChaotic ? 0.18 : 0.12)
        p.x = lerp(p.x, mouse.x, pull)
        p.y = lerp(p.y, mouse.y, pull)
      }
    }

    constrainRegion(p, activeRegion, constrainHard)
  }
}

export function renderParticles(
  ctx: CanvasRenderingContext2D,
  offCtx: CanvasRenderingContext2D,
  offscreen: HTMLCanvasElement,
  particles: EngineParticle[],
  width: number,
  height: number,
  mouse: MouseLocal,
  color: string = PARTICLE_COLOR,
  mouseEnabled = true,
) {
  ctx.clearRect(0, 0, width, height)
  offCtx.clearRect(0, 0, width, height)

  let maxCluster = 0
  if (mouse.active && mouseEnabled) {
    for (const p of particles) {
      const dx = mouse.x - p.x
      const dy = mouse.y - p.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < ATTRACT_RADIUS) {
        maxCluster = Math.max(maxCluster, 1 - dist / ATTRACT_RADIUS)
      }
    }
  }

  for (const p of particles) {
    let blur = 0
    let alpha = 0.75

    if (mouse.active && mouseEnabled) {
      const dx = mouse.x - p.x
      const dy = mouse.y - p.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < ATTRACT_RADIUS) {
        const proximity = 1 - dist / ATTRACT_RADIUS
        blur = proximity * 14 * maxCluster
        alpha = 0.6 + proximity * 0.4
      }
    }

    drawSphere(offCtx, p.x, p.y, p.size, alpha, color, blur)
  }

  ctx.globalAlpha = 0.85
  ctx.drawImage(offscreen, 0, 0, width, height)
  ctx.globalAlpha = 1

  if (maxCluster > 0.1) {
    for (const p of particles) {
      const dx = mouse.x - p.x
      const dy = mouse.y - p.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < ATTRACT_RADIUS * 0.6) {
        drawSphere(ctx, p.x, p.y, p.size * 0.9, 0.35, color, 0)
      }
    }
  }
}

export function getRegion(
  width: number,
  height: number,
  bounds: 'full' | 'right' | 'left',
) {
  if (bounds === 'right') {
    const regionW = width / 2
    return { x: regionW, y: 0, w: regionW, h: height }
  }
  if (bounds === 'left') {
    const regionW = width / 2
    return { x: 0, y: 0, w: regionW, h: height }
  }
  return { x: 0, y: 0, w: width, h: height }
}
