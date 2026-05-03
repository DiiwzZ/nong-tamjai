import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Plus } from 'lucide-react'

const ACTIONS = [
  {
    id: 'task',
    label: 'Task ใหม่',
    color: '#3b82f6',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="3"/>
        <path d="M9 12l2 2 4-4"/>
      </svg>
    ),
  },
  {
    id: 'sub',
    label: 'Subscription',
    color: '#8b5cf6',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2"/>
        <path d="M1 10h22"/>
      </svg>
    ),
  },
]

export function QuickAddFAB({ onSelect, defaultAction = 'task' }) {
  const [open, setOpen] = useState(false)
  const pressTimer = useRef(null)
  const didLongPress = useRef(false)

  const startPress = () => {
    didLongPress.current = false
    pressTimer.current = setTimeout(() => {
      didLongPress.current = true
      setOpen(true)
    }, 380)
  }

  const endPress = () => {
    clearTimeout(pressTimer.current)
    if (!didLongPress.current) {
      onSelect(defaultAction)
    }
  }

  const select = (id) => {
    setOpen(false)
    onSelect(id)
  }

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 20 }}
          />
        )}
      </AnimatePresence>

      {/* Action items */}
      <AnimatePresence>
        {open && (
          <div style={{
            position: 'fixed', bottom: 110, right: 20,
            zIndex: 30, display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            {ACTIONS.map(({ id, label, color, icon }, i) => (
              <motion.button
                key={id}
                initial={{ opacity: 0, x: 20, scale: 0.85 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.85 }}
                transition={{ delay: i * 0.04, type: 'spring', stiffness: 400, damping: 28 }}
                onClick={() => select(id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  height: 48, paddingLeft: 12, paddingRight: 16,
                  borderRadius: 16,
                  background: '#1a1a22',
                  border: '1px solid #252530',
                  cursor: 'pointer', fontFamily: 'inherit',
                  boxShadow: '0 8px 28px rgba(0,0,0,0.4)',
                }}
              >
                <div style={{
                  width: 32, height: 32, borderRadius: 10,
                  background: `${color}20`,
                  border: `1px solid ${color}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color,
                }}>
                  {icon}
                </div>
                <span style={{
                  fontSize: 14, fontWeight: 600, color: '#f0f0f8',
                  whiteSpace: 'nowrap',
                }}>
                  {label}
                </span>
              </motion.button>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        onPointerDown={startPress}
        onPointerUp={endPress}
        onPointerLeave={() => clearTimeout(pressTimer.current)}
        whileTap={{ scale: 0.88 }}
        animate={{ rotate: open ? 45 : 0 }}
        transition={{ duration: 0.18 }}
        style={{
          position: 'fixed', bottom: 92, right: 20,
          width: 56, height: 56,
          borderRadius: 18,
          background: '#3b82f6',
          border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', zIndex: 30,
          boxShadow: '0 4px 20px rgba(59,130,246,0.4)',
        }}
      >
        <Plus size={26} color="#fff" strokeWidth={2.5} />
      </motion.button>
    </>
  )
}
