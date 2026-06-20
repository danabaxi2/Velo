import { useEffect, useRef } from 'react'
import {
  createParticlesFromScatter,
  assignBlendedTargets,
  assignShapeTargets,
  updateParticles,
  renderParticles,
  getRegion,
  PARTICLE_COLOR,
  type EngineParticle,
  type ParticleMode,
} from '../lib/particleEngine'
import { getShapePoints, getScatterPoints, type ShapeType, type ShapePoint } from '../lib/particleShapes'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import type { MouseState } from '../types/mouse'

export type ParticleBounds = 'full' | 'right' | 'left'

interface ParticleFieldProps {
  mouse: MouseState
  bounds?: ParticleBounds
  className?: string
  count?: number
  mode?: ParticleMode
  shape?: ShapeType
  shapeBlend?: number
  shapeCenter?: { x: number; y: number }
  shapeScale?: number
  scatterRegion?: 'full' | 'right'
  morphShape?: ShapeType
  morphProgress?: number
  morphAnchor?: { x: number; y: number }
  disableMouseAboveBlend?: number
  morphFrom?: ShapeType
  morphTo?: ShapeType
}

const DEFAULT_COUNT = 2400
const PARTICLE_SIZE = 10

export function ParticleField({
  mouse,
  bounds = 'full',
  className = '',
  count = DEFAULT_COUNT,
  mode = 'ambient',
  shape = 'plusCorners',
  shapeBlend = 0,
  shapeCenter,
  shapeScale = 2,
  scatterRegion = 'full',
  morphShape,
  morphProgress = 0,
  morphAnchor,
  disableMouseAboveBlend = 0.15,
  morphFrom,
  morphTo,
}: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const offscreenRef = useRef<HTMLCanvasElement | null>(null)
  const particlesRef = useRef<EngineParticle[]>([])
  const scatterPointsRef = useRef<ShapePoint[]>([])
  const mouseRef = useRef(mouse)
  const configRef = useRef({
    bounds,
    count,
    mode,
    shape,
    shapeBlend,
    shapeCenter,
    shapeScale,
    scatterRegion,
    morphShape,
    morphProgress,
    morphAnchor,
    disableMouseAboveBlend,
    morphFrom,
    morphTo,
  })
  const rafRef = useRef(0)
  const timeRef = useRef(0)
  const reducedMotion = usePrefersReducedMotion()

  configRef.current = {
    bounds,
    count,
    mode,
    shape,
    shapeBlend,
    shapeCenter,
    shapeScale,
    scatterRegion,
    morphShape,
    morphProgress,
    morphAnchor,
    disableMouseAboveBlend,
    morphFrom,
    morphTo,
  }
  mouseRef.current = mouse

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = 0
    let height = 0
    let fullRegion = { x: 0, y: 0, w: 0, h: 0 }
    let rightRegion = { x: 0, y: 0, w: 0, h: 0 }

    const offscreen = document.createElement('canvas')
    offscreenRef.current = offscreen
    const offCtx = offscreen.getContext('2d')!

    const rebuildScatter = () => {
      const cfg = configRef.current
      const scatterBounds = cfg.scatterRegion === 'right' ? 'right' : cfg.bounds
      rightRegion = getRegion(width, height, 'right')
      const region = getRegion(width, height, scatterBounds)
      scatterPointsRef.current = getScatterPoints(cfg.count, region, PARTICLE_SIZE)
      particlesRef.current = createParticlesFromScatter(scatterPointsRef.current, PARTICLE_SIZE)
    }

    const applyTargets = () => {
      const cfg = configRef.current
      const particles = particlesRef.current
      if (particles.length === 0) return

      const isMorph = cfg.morphProgress > 0 && cfg.morphShape && cfg.morphAnchor

      if (isMorph) {
        const shapePoints = getShapePoints(
          cfg.morphShape!,
          cfg.morphAnchor!.x,
          cfg.morphAnchor!.y,
          cfg.shapeScale,
          cfg.count,
          width,
          height,
        )
        assignBlendedTargets(
          particles,
          scatterPointsRef.current,
          shapePoints,
          cfg.morphProgress,
          PARTICLE_SIZE,
        )
        return
      }

      if (cfg.morphFrom && cfg.morphTo && cfg.shapeBlend > 0) {
        const cx = cfg.shapeCenter?.x ?? width / 2
        const cy = cfg.shapeCenter?.y ?? height / 2
        const from = getShapePoints(cfg.morphFrom, cx, cy, cfg.shapeScale, cfg.count, width, height)
        const to = getShapePoints(cfg.morphTo, cx, cy, cfg.shapeScale, cfg.count, width, height)
        const blended = from.map((p, i) => {
          const t = cfg.shapeBlend
          const pb = to[i % to.length]
          return {
            x: p.x + (pb.x - p.x) * t,
            y: p.y + (pb.y - p.y) * t,
            size: p.size + (pb.size - p.size) * t,
          }
        })
        assignShapeTargets(particles, blended, PARTICLE_SIZE)
        return
      }

      if (cfg.mode === 'shape' && cfg.shapeBlend > 0) {
        const cx = cfg.shapeCenter?.x ?? width / 2
        const cy = cfg.shapeCenter?.y ?? height / 2
        const points = getShapePoints(cfg.shape, cx, cy, cfg.shapeScale, cfg.count, width, height)
        assignShapeTargets(particles, points, PARTICLE_SIZE)
      }
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      width = rect.width
      height = rect.height
      canvas.width = width * dpr
      canvas.height = height * dpr
      offscreen.width = width * dpr
      offscreen.height = height * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      offCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
      fullRegion = getRegion(width, height, 'full')
      rebuildScatter()
      applyTargets()
      timeRef.current = 0
    }

    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)

    const render = () => {
      if (document.hidden) {
        rafRef.current = requestAnimationFrame(render)
        return
      }

      const cfg = configRef.current
      applyTargets()

      const rect = canvas.getBoundingClientRect()
      const { x: mx, y: my, active } = mouseRef.current
      const localMouse = { x: mx - rect.left, y: my - rect.top, active }

      const morph = cfg.morphProgress ?? 0
      const mouseEnabled = !active || morph <= cfg.disableMouseAboveBlend

      if (!reducedMotion) {
        timeRef.current += 16
        updateParticles(particlesRef.current, timeRef.current, localMouse, {
          mode: cfg.mode,
          shapeBlend: cfg.shapeBlend,
          morphProgress: morph,
          region: fullRegion,
          fullRegion,
          scatterRegion: rightRegion,
          disableMouseAboveBlend: cfg.disableMouseAboveBlend,
          reducedMotion,
        })
      }

      renderParticles(
        ctx,
        offCtx,
        offscreen,
        particlesRef.current,
        width,
        height,
        localMouse,
        PARTICLE_COLOR,
        mouseEnabled,
      )
      rafRef.current = requestAnimationFrame(render)
    }

    rafRef.current = requestAnimationFrame(render)

    return () => {
      observer.disconnect()
      cancelAnimationFrame(rafRef.current)
      offscreenRef.current = null
    }
  }, [reducedMotion])

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      aria-hidden="true"
    />
  )
}
