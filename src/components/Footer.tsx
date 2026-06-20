import { useEffect, useRef } from 'react'
import footerVideo from '../assets/velo_short.mp4'
import { easeSwoosh, useSectionScrollProgress } from '../hooks/useSectionScrollProgress'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'

const PLAYBACK_RATE = 0.4

export function Footer() {
  const sectionRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const progress = useSectionScrollProgress(sectionRef)
  const reducedMotion = usePrefersReducedMotion()

  const panProgress = easeSwoosh(progress)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.playbackRate = PLAYBACK_RATE

    if (reducedMotion) {
      video.pause()
      video.currentTime = video.duration * 0.5
      return
    }

    video.play().catch(() => {})
  }, [reducedMotion])

  return (
    <footer ref={sectionRef} id="contact" className="relative h-[200vh] w-full">
      <div className="sticky top-0 flex h-screen flex-col justify-end overflow-hidden border-t border-black/10">
        <video
          ref={videoRef}
          src={footerVideo}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="pointer-events-none absolute inset-0 h-[140%] w-full object-cover opacity-60"
          style={{ transform: `translateY(${-panProgress * 28}%)` }}
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#f2f2f2] via-[#f2f2f2]/40 to-transparent"
          aria-hidden
        />
        <div className="relative z-10 w-full px-8 pb-16 pt-24">
          <div className="flex w-full flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm text-black">Velo</p>
              <p className="mt-2 max-w-sm text-sm text-black/60">
                Agentic operations for enterprise systems — governed by human approval.
              </p>
            </div>
            <div className="text-left sm:text-right">
              <a
                href="mailto:hello@velo.ai"
                className="text-sm text-black/60 transition-opacity hover:text-black hover:opacity-100"
              >
                hello@velo.ai
              </a>
              <p className="mt-3 text-xs text-black/40">
                &copy; {new Date().getFullYear()} Velo. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
