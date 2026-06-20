import { useState } from 'react'
import { motion } from 'framer-motion'
import { FeatureParticleCanvas } from './FeatureParticleCanvas'
import type { MouseState } from '../types/mouse'
import type { ShapeType } from '../lib/particleShapes'
import type { ParticleMode } from '../lib/particleEngine'

interface FeatureCardProps {
  title: string
  description: string
  defaultShape: ShapeType
  hoverShape?: ShapeType
  hoverMode?: ParticleMode
  mouse: MouseState
  index: number
}

const revealEase = [0.22, 1, 0.36, 1] as const

export function FeatureCard({
  title,
  description,
  defaultShape,
  hoverShape,
  hoverMode = 'shape',
  mouse,
  index,
}: FeatureCardProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.9, delay: index * 0.12, ease: revealEase }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="glass grid w-full grid-cols-1 items-center gap-6 rounded-3xl border border-black p-8 md:grid-cols-[175px_1fr_1fr] md:gap-8"
    >
      <div className="flex justify-center md:justify-start">
        <FeatureParticleCanvas
          defaultShape={defaultShape}
          hoverShape={hoverShape}
          hoverMode={hoverMode}
          isHovered={hovered}
          mouse={mouse}
        />
      </div>
      <h3 className="text-center text-[38px] leading-tight tracking-[-0.01em] text-black md:text-left lg:text-center">
        {title}
      </h3>
      <p className="text-[25px] leading-[26px] text-black/70">{description}</p>
    </motion.article>
  )
}
