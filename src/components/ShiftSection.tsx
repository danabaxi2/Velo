import { useEffect, useRef, useState } from 'react'
import { ParticleField } from './ParticleField'
import { useSectionScrollProgress, mapProgress } from '../hooks/useSectionScrollProgress'
import type { MouseState } from '../types/mouse'

interface ShiftSectionProps {
  mouse: MouseState
}

function easeBezier(t: number) {
  const t2 = t * t
  const t3 = t2 * t
  return 3 * (1 - t) * (1 - t) * t * 0.76 + 3 * (1 - t) * t2 * 0.24 + t3
}

/** plusCorners outer radius ≈ 28 * scale * 1.55 + jitter */
const SHAPE_SCALE = 3.4
const SHAPE_HALF_EXTENT = 28 * SHAPE_SCALE * 1.55 + 16
const GAP_ABOVE_BODY = 250

export function ShiftSection({ mouse }: ShiftSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const headlineRef = useRef<HTMLHeadingElement>(null)
  const bodyRef = useRef<HTMLParagraphElement>(null)
  const progress = useSectionScrollProgress(sectionRef)
  const [morphAnchor, setMorphAnchor] = useState({ x: 200, y: 500 })

  const headlineProgress = easeBezier(mapProgress(progress, 0.2, 0.9))
  const particleProgress = easeBezier(mapProgress(progress, 0.3, 1))

  const headlineShift =
    typeof window !== 'undefined' ? headlineProgress * window.innerWidth * 0.48 : 0

  useEffect(() => {
    const update = () => {
      if (!bodyRef.current || !stickyRef.current) return
      const stickyRect = stickyRef.current.getBoundingClientRect()
      const bodyRect = bodyRef.current.getBoundingClientRect()
      const halfWidth = stickyRect.width * 0.5

      const bodyTop = bodyRect.top - stickyRect.top
      const headlineBottom = headlineRef.current
        ? headlineRef.current.getBoundingClientRect().bottom - stickyRect.top
        : bodyTop - 320

      const gapTop = headlineBottom + 32
      const gapBottom = bodyTop - GAP_ABOVE_BODY
      const gapMidY = (gapTop + gapBottom) / 2

      const bodyCenterX = bodyRect.left - stickyRect.left + bodyRect.width * 0.45
      const maxCenterX = halfWidth - SHAPE_HALF_EXTENT - 12
      const minCenterX = SHAPE_HALF_EXTENT + 24
      const anchorX = Math.max(minCenterX, Math.min(bodyCenterX, maxCenterX))

      const minCenterY = gapTop + SHAPE_HALF_EXTENT
      const maxCenterY = gapBottom - SHAPE_HALF_EXTENT
      const anchorY =
        maxCenterY >= minCenterY
          ? Math.max(minCenterY, Math.min(gapMidY, maxCenterY))
          : gapMidY

      setMorphAnchor({ x: anchorX, y: anchorY })
    }

    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return (
    <section ref={sectionRef} id="shift" className="relative h-[200vh]">
      <div ref={stickyRef} className="sticky top-0 h-screen overflow-hidden">
        <ParticleField
          mouse={mouse}
          bounds="full"
          scatterRegion="right"
          count={2400}
          mode="ambient"
          morphShape="plusCorners"
          morphProgress={particleProgress}
          morphAnchor={morphAnchor}
          shapeScale={SHAPE_SCALE}
          disableMouseAboveBlend={0.15}
        />

        <div className="relative z-10 flex h-full flex-col px-8 pb-12 pt-28">
          <div className="max-w-lg">
            <p className="mb-6 text-[14px] font-medium uppercase tracking-[0.2em] text-accent-teal">
              THE SHIFT
            </p>
            <h2
              ref={headlineRef}
              className="max-w-lg text-[44px] font-normal leading-[45px] tracking-[-0.02em] text-black will-change-transform"
              style={{ transform: `translateX(${headlineShift}px)` }}
            >
              From specialists manually configuring systems, to business users describing what they
              need.
            </h2>
          </div>

          <p
            ref={bodyRef}
            className="mt-auto max-w-md pb-4 text-[25px] leading-[26px] text-black/80"
          >
            Enterprise systems are the operational backbone of modern companies, yet their
            implementation remains slow, expensive, and dependent on human middleware. Velo changes
            that.
          </p>
        </div>
      </div>
    </section>
  )
}
