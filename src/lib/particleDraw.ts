import { hexToRgb, lightenRgb } from './color'

export function drawSphere(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  alpha: number,
  color: string,
  blur = 0,
) {
  const radius = size / 2
  const base = hexToRgb(color)
  const mid = lightenRgb(base, 0.35)
  const glow = lightenRgb(base, 0.15)

  const gradient = ctx.createRadialGradient(
    x - radius * 0.2,
    y - radius * 0.2,
    0,
    x,
    y,
    radius,
  )
  gradient.addColorStop(0, `rgba(255, 255, 255, ${0.9 * alpha})`)
  gradient.addColorStop(0.45, `rgba(${mid.r}, ${mid.g}, ${mid.b}, ${0.75 * alpha})`)
  gradient.addColorStop(1, `rgba(${base.r}, ${base.g}, ${base.b}, ${0.5 * alpha})`)

  ctx.save()
  ctx.shadowBlur = blur
  ctx.shadowColor = `rgba(${glow.r}, ${glow.g}, ${glow.b}, ${0.6 * alpha})`
  ctx.fillStyle = gradient
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
}
