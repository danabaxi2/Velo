import type { ReactNode } from 'react'

interface OutlineButtonProps {
  href: string
  children: ReactNode
  className?: string
}

export function OutlineButton({ href, children, className = '' }: OutlineButtonProps) {
  return (
    <a
      href={href}
      className={`inline-block rounded-full border border-black px-6 py-2 text-sm transition-colors duration-300 hover:border-accent-mint hover:bg-accent-mint hover:text-black ${className}`}
    >
      {children}
    </a>
  )
}
