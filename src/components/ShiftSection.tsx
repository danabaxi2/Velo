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

export function ShiftSection({ mouse }: ShiftSectionProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const stickyRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLParagraphElement>(null)
  const progress = useSectionScrollProgress(sectionRef)
  const [anchors, setAnchors] = useState({
    leftX: 200,
    leftY: 500,
    rightX: 600,
    rightY: 500,
  })

  const headlineProgress = easeBezier(mapProgress(progress, 0.2, 0.9))
  const particleProgress = easeBezier(mapProgress(progress, 0.3, 1))

  const headlineShift =
    typeof window !== 'undefined' ? headlineProgress * window.innerWidth * 0.48 : 0

  const morphAnchor = {
    x: anchors.leftX + (anchors.rightX - anchors.leftX) * (1 - particleProgress),
    y: anchors.leftY,
  }

  useEffect(() => {
    const update = () => {
      if (!bodyRef.current || !stickyRef.current) return
      const stickyRect = stickyRef.current.getBoundingClientRect()
      const bodyRect = bodyRef.current.getBoundingClientRect()

      const leftX = bodyRect.left - stickyRect.left + bodyRect.width * 0.5
      const leftY = bodyRect.top - stickyRect.top - 150
      const rightX = stickyRect.width * 0.75
      const rightY = stickyRect.height * 0.45

      setAnchors({ leftX, leftY, rightX, rightY })
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
          shapeScale={1.5}
          disableMouseAboveBlend={0.15}
        />

        <div className="relative z-10 flex h-full flex-col px-8 pb-12 pt-28">
          <div className="max-w-lg">
            <p className="mb-6 text-[14px] font-medium uppercase tracking-[0.2em] text-accent-teal">
              THE SHIFT
            </p>
            <h2
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
