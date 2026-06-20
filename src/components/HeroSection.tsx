import { motion } from 'framer-motion'
import { ParticleField } from './ParticleField'
import { OutlineButton } from './OutlineButton'
import type { MouseState } from '../types/mouse'

interface HeroSectionProps {
  mouse: MouseState
}

const revealEase = [0.22, 1, 0.36, 1] as const

export function HeroSection({ mouse }: HeroSectionProps) {
  return (
    <section id="platform" className="relative min-h-screen overflow-hidden">
      <ParticleField mouse={mouse} bounds="full" count={2400} />

      <div className="relative z-10 flex min-h-screen flex-col px-8 pb-12 pt-28">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: revealEase }}
          className="max-w-xl"
        >
          <p className="mb-4 text-[14px] font-medium uppercase tracking-[0.2em] text-accent-teal/60">
            AI-NATIVE ENTERPRISE OPERATIONS
          </p>
          <h1 className="text-[clamp(2rem,4.5vw,3.5rem)] font-normal leading-[55px] tracking-[-0.02em] text-black">
            Enterprise systems, described in plain language.
          </h1>
          <div className="mt-8">
            <OutlineButton href="#contact">Request access</OutlineButton>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.15, ease: revealEase }}
          className="mt-auto self-end"
        >
          <div className="max-w-sm rounded-3xl border border-black p-[19px]">
            <p className="text-base leading-[21px] text-black/80">
              Velo consolidates work across integrators, admins, and project managers into one
              agentic platform governed by human approval and transparent business logic.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
