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
      className={`glass-button inline-block rounded-full border border-black px-6 py-2 text-sm text-black ${className}`}
    >
      {children}
    </a>
  )
}
