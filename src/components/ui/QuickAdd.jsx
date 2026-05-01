import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, CheckSquare, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'

const ACTIONS = [
  { id: 'task', label: 'Task ใหม่', icon: CheckSquare, color: 'bg-blue-500' },
  { id: 'sub', label: 'Subscription', icon: CreditCard, color: 'bg-emerald-500' },
]

export function QuickAddFAB({ onSelect }) {
  const [open, setOpen] = useState(false)
  const pressTimer = useRef(null)
  const didLongPress = useRef(false)

  const startPress = () => {
    didLongPress.current = false
    pressTimer.current = setTimeout(() => {
      didLongPress.current = true
      setOpen(true)
    }, 400)
  }

  const endPress = () => {
    clearTimeout(pressTimer.current)
    if (!didLongPress.current) {
      onSelect('task')
    }
  }

  const select = (id) => {
    setOpen(false)
    onSelect(id)
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="fixed fab-menu-bottom right-5 z-30 flex flex-col-reverse gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {ACTIONS.map(({ id, label, icon: Icon, color }, i) => (
                <motion.button
                  key={id}
                  initial={{ opacity: 0, y: 10, scale: 0.88 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.88, transition: { duration: 0.15 } }}
                  transition={{ type: 'spring', stiffness: 420, damping: 28, delay: i * 0.07 }}
                  onClick={() => select(id)}
                  aria-label={label}
                  className="flex h-12 items-center gap-3 rounded-[1.15rem] border border-white/7 bg-card/96 pl-3 pr-4 shadow-[0_22px_40px_-24px_rgba(0,0,0,1)]"
                >
                  <div className={cn('flex h-8 w-8 items-center justify-center rounded-xl text-white', color)}>
                    <Icon size={16} />
                  </div>
                  <span className="whitespace-nowrap text-sm font-medium text-foreground">{label}</span>
                </motion.button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <motion.button
        onPointerDown={startPress}
        onPointerUp={endPress}
        onPointerLeave={() => clearTimeout(pressTimer.current)}
        whileTap={{ scale: 0.88 }}
        animate={{ rotate: open ? 45 : 0 }}
        transition={{ type: 'spring', stiffness: 420, damping: 28 }}
        aria-label="เพิ่มรายการใหม่"
        className="fixed fab-bottom right-5 z-30 flex h-13 w-13 items-center justify-center rounded-[1.25rem] border border-primary/35 bg-[linear-gradient(180deg,rgba(74,149,255,1),rgba(42,108,243,1))] text-white shadow-[0_18px_38px_-10px_rgba(59,130,246,0.72)]"
      >
        <Plus size={24} strokeWidth={2.4} />
      </motion.button>
    </>
  )
}
