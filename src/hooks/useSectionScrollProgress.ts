import { useEffect, useState, type RefObject } from 'react'
import { useLenis } from '../components/LenisProvider'

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function mapRange(value: number, inMin: number, inMax: number) {
  if (inMax <= inMin) return 0
  return clamp((value - inMin) / (inMax - inMin), 0, 1)
}

export function useSectionScrollProgress(sectionRef: RefObject<HTMLElement | null>) {
  const lenis = useLenis()
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const update = () => {
      const rect = section.getBoundingClientRect()
      const viewportH = window.innerHeight
      const scrollable = rect.height - viewportH

      if (scrollable <= 0) {
        setProgress(0)
        return
      }

      const scrolled = -rect.top
      setProgress(mapRange(scrolled, 0, scrollable))
    }

    update()
    lenis?.on('scroll', update)
    window.addEventListener('resize', update)

    return () => {
      lenis?.off('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [lenis, sectionRef])

  return progress
}

export function easeSwoosh(t: number) {
  const t2 = t * t
  const t3 = t2 * t
  return 3 * (1 - t) * (1 - t) * t * 0.76 + 3 * (1 - t) * t2 * 0.24 + t3
}

export function mapProgress(t: number, start: number, end: number) {
  return clamp(mapRange(t, start, end), 0, 1)
}
