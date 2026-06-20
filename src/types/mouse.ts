export interface MouseState {
  x: number
  y: number
  active: boolean
}

export const INACTIVE_MOUSE: MouseState = { x: -9999, y: -9999, active: false }
