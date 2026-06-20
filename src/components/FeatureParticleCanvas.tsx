import { useEffect, useRef } from 'react'
import {
  createParticlesFromScatter,
  assignShapeTargets,
  updateParticles,
  renderParticles,
  PARTICLE_COLOR,
  type EngineParticle,
  type ParticleMode,
} from '../lib/particleEngine'
import {
  getShapePoints,
  getScatterPoints,
  blendShapePoints,
  type ShapeType,
} from '../lib/particleShapes'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import type { MouseState } from '../types/mouse'

interface FeatureParticleCanvasProps {
  defaultShape: ShapeType
  hoverShape?: ShapeType
  hoverMode?: ParticleMode
  isHovered: boolean
  mouse: MouseState
}

const PARTICLE_COUNT = 100
const PARTICLE_SIZE = 10
const CANVAS_SIZE = 175

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

export function FeatureParticleCanvas({
  defaultShape,
  hoverShape,
  hoverMode = 'shape',
  isHovered,
  mouse,
}: FeatureParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<EngineParticle[]>([])
  const morphRef = useRef(0)
  const rafRef = useRef(0)
  const timeRef = useRef(0)
  const mouseRef = useRef(mouse)
  const isHoveredRef = useRef(isHovered)
  const reducedMotion = usePrefersReducedMotion()

  mouseRef.current = mouse
  isHoveredRef.current = isHovered

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const offscreen = document.createElement('canvas')
    const offCtx = offscreen.getContext('2d')!
    const cx = CANVAS_SIZE / 2
    const cy = CANVAS_SIZE / 2
    const region = { x: 0, y: 0, w: CANVAS_SIZE, h: CANVAS_SIZE }

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = CANVAS_SIZE * dpr
    canvas.height = CANVAS_SIZE * dpr
    offscreen.width = CANVAS_SIZE * dpr
    offscreen.height = CANVAS_SIZE * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    offCtx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const scatterPoints = getScatterPoints(PARTICLE_COUNT, region, PARTICLE_SIZE)
    particlesRef.current = createParticlesFromScatter(scatterPoints, PARTICLE_SIZE)

    const render = () => {
      const hovered = isHoveredRef.current
      const targetMorph = hovered ? 1 : 0
      morphRef.current = lerp(morphRef.current, targetMorph, 0.06)

      if (!reducedMotion) timeRef.current += 16

      const mode: ParticleMode =
        hovered && hoverMode === 'chaotic' ? 'chaotic' : hovered ? 'shape' : 'shape'

      let points
      if (hovered && hoverShape && hoverMode === 'shape') {
        const from = getShapePoints(defaultShape, cx, cy, 1.1, PARTICLE_COUNT, CANVAS_SIZE, CANVAS_SIZE)
        const to = getShapePoints(hoverShape, cx, cy, 1.1, PARTICLE_COUNT, CANVAS_SIZE, CANVAS_SIZE)
        points = blendShapePoints(from, to, morphRef.current)
      } else if (hovered && hoverMode === 'chaotic') {
        points = getShapePoints('scatter', cx, cy, 1.1, PARTICLE_COUNT, CANVAS_SIZE, CANVAS_SIZE)
      } else {
        points = getShapePoints(defaultShape, cx, cy, 1.1, PARTICLE_COUNT, CANVAS_SIZE, CANVAS_SIZE)
      }

      assignShapeTargets(particlesRef.current, points, PARTICLE_SIZE)

      const rect = canvas.getBoundingClientRect()
      const { x: mx, y: my, active } = mouseRef.current
      const localMouse = { x: mx - rect.left, y: my - rect.top, active }

      if (!reducedMotion) {
        updateParticles(particlesRef.current, timeRef.current, localMouse, {
          mode,
          shapeBlend: hovered && hoverMode === 'chaotic' ? 0.2 : 0.85,
          region,
          fullRegion: region,
          flowStrength: hovered && hoverMode === 'chaotic' ? 0.45 : 0.15,
        })
      }

      renderParticles(
        ctx,
        offCtx,
        offscreen,
        particlesRef.current,
        CANVAS_SIZE,
        CANVAS_SIZE,
        localMouse,
        PARTICLE_COLOR,
      )

      rafRef.current = requestAnimationFrame(render)
    }

    rafRef.current = requestAnimationFrame(render)
    return () => cancelAnimationFrame(rafRef.current)
  }, [defaultShape, hoverShape, hoverMode, reducedMotion])

  return (
    <canvas
      ref={canvasRef}
      className="h-[175px] w-[175px]"
      aria-hidden="true"
    />
  )
}
