import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import Lenis from 'lenis'

const LenisContext = createContext<Lenis | null>(null)

export function useLenis() {
  return useContext(LenisContext)
}

interface LenisProviderProps {
  children: ReactNode
}

export function LenisProvider({ children }: LenisProviderProps) {
  const [lenis, setLenis] = useState<Lenis | null>(null)
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    const instance = new Lenis({
      lerp: 0.08,
      duration: 1.2,
      smoothWheel: true,
      wheelMultiplier: 1.2,
      anchors: true,
    })

    lenisRef.current = instance
    setLenis(instance)

    let rafId = 0
    const raf = (time: number) => {
      instance.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      instance.destroy()
      lenisRef.current = null
    }
  }, [])

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>
}
