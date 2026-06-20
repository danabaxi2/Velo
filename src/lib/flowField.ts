import { createNoise2D } from 'simplex-noise'

const noise2D = createNoise2D()
const TAU = Math.PI * 2
const SCALE = 0.0035

export function getFlowVector(
  x: number,
  y: number,
  time = 0,
  strength = 0.25,
): { vx: number; vy: number } {
  const n1 = noise2D(x * SCALE + time * 0.00012, y * SCALE + time * 0.0001)
  const n2 = noise2D(x * SCALE * 2.4 + 100, y * SCALE * 2.4 + 100) * 0.5
  const angle = (n1 + n2) * TAU

  return {
    vx: Math.cos(angle) * strength,
    vy: Math.sin(angle) * strength,
  }
}

export function getTurbulence(x: number, y: number, time: number, phase: number) {
  const tx = Math.sin(time * 0.0009 + phase + x * 0.008) * 0.35
  const ty = Math.cos(time * 0.0007 + phase + y * 0.008) * 0.35
  return { tx, ty }
}
