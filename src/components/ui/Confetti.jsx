import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#f43f5e', '#8b5cf6', '#06b6d4']

function Particle({ x, y, color }) {
  const angle = Math.random() * 360
  const distance = 60 + Math.random() * 80
  const tx = Math.cos((angle * Math.PI) / 180) * distance
  const ty = Math.sin((angle * Math.PI) / 180) * distance - 40
  const size = 4 + Math.random() * 6
  const isCircle = Math.random() > 0.5

  return (
    <motion.div
      className="fixed pointer-events-none z-50"
      style={{
        left: x,
        top: y,
        width: size,
        height: isCircle ? size : size * 0.5,
        borderRadius: isCircle ? '50%' : 2,
        backgroundColor: color,
      }}
      initial={{ opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 }}
      animate={{
        opacity: 0,
        scale: 0.3,
        x: tx,
        y: ty,
        rotate: Math.random() * 360,
      }}
      transition={{ duration: 0.7 + Math.random() * 0.3, ease: 'easeOut' }}
    />
  )
}

export function Confetti({ trigger, x = window.innerWidth / 2, y = window.innerHeight / 2 }) {
  if (!trigger) return null

  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    color: COLORS[i % COLORS.length],
  }))

  return (
    <AnimatePresence>
      {particles.map((p) => (
        <Particle key={p.id} x={x} y={y} color={p.color} />
      ))}
    </AnimatePresence>
  )
}
