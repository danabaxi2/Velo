import { useEffect, useState } from 'react'
import { LenisProvider } from './components/LenisProvider'
import { Navbar } from './components/Navbar'
import { HeroSection } from './components/HeroSection'
import { ShiftSection } from './components/ShiftSection'
import { FeaturesSection } from './components/FeaturesSection'
import { Footer } from './components/Footer'
import { INACTIVE_MOUSE, type MouseState } from './types/mouse'

function App() {
  const [mouse, setMouse] = useState<MouseState>(INACTIVE_MOUSE)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setMouse({ x: e.clientX, y: e.clientY, active: true })
    }
    const onLeave = () => {
      setMouse((m) => ({ ...m, active: false }))
    }

    window.addEventListener('mousemove', onMove)
    document.documentElement.addEventListener('mouseleave', onLeave)

    return () => {
      window.removeEventListener('mousemove', onMove)
      document.documentElement.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <LenisProvider>
      <Navbar />
      <main>
        <HeroSection mouse={mouse} />
        <ShiftSection mouse={mouse} />
        <FeaturesSection mouse={mouse} />
      </main>
      <Footer />
    </LenisProvider>
  )
}

export default App
