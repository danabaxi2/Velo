import { OutlineButton } from './OutlineButton'

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/55 px-8 py-5 backdrop-blur-xl">
      <div className="flex items-center justify-between">
        <a href="#platform" className="text-sm text-black">
          Velo
        </a>
        <div className="flex items-center gap-6 sm:gap-8">
          <a href="#platform" className="text-sm text-black transition-opacity hover:opacity-60">
            Platform
          </a>
          <a href="#features" className="text-sm text-black transition-opacity hover:opacity-60">
            Features
          </a>
          <OutlineButton href="#contact">Request access</OutlineButton>
        </div>
      </div>
    </nav>
  )
}
