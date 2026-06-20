import { motion } from 'framer-motion'
import { FeatureCard } from './FeatureCard'
import type { MouseState } from '../types/mouse'

const features = [
  {
    title: 'One platform',
    description:
      'Consolidate work traditionally split across system integrators, admins, and project managers into a single AI-native solution.',
    defaultShape: 'plusMerged' as const,
    hoverMode: 'chaotic' as const,
  },
  {
    title: 'Human-governed',
    description:
      'Every agentic action flows through human approval. You stay in control while automation handles the heavy lifting.',
    defaultShape: 'plusMerged' as const,
    hoverShape: 'human' as const,
    hoverMode: 'shape' as const,
  },
  {
    title: 'Transparent Logic',
    description:
      'Business rules are visible, auditable, and expressed in plain language — not buried in configuration scripts.',
    defaultShape: 'xShape' as const,
    hoverShape: 'emptySquare' as const,
    hoverMode: 'shape' as const,
  },
]

const revealEase = [0.22, 1, 0.36, 1] as const

interface FeaturesSectionProps {
  mouse: MouseState
}

export function FeaturesSection({ mouse }: FeaturesSectionProps) {
  return (
    <section id="features" className="relative w-full px-8 py-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-40px' }}
        transition={{ duration: 0.9, ease: revealEase }}
        className="mb-12"
      >
        <p className="text-[14px] font-medium uppercase tracking-[0.2em] text-accent-teal">
          Capabilities
        </p>
      </motion.div>

      <div className="flex w-full flex-col gap-6">
        {features.map((feature, i) => (
          <FeatureCard
            key={feature.title}
            title={feature.title}
            description={feature.description}
            defaultShape={feature.defaultShape}
            hoverShape={feature.hoverShape}
            hoverMode={feature.hoverMode}
            mouse={mouse}
            index={i}
          />
        ))}
      </div>
    </section>
  )
}
