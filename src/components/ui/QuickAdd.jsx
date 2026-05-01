import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, CheckSquare, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'

const ACTIONS = [
  { id: 'task', label: 'Task ใหม่', icon: CheckSquare, color: 'bg-blue-500' },
  { id: 'sub', label: 'Subscription', icon: CreditCard, color: 'bg-purple-500' },
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
              className="fixed bottom-28 right-5 z-30 flex flex-col-reverse gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {ACTIONS.map(({ id, label, icon: Icon, color }, i) => (
                <motion.button
                  key={id}
                  initial={{ opacity: 0, x: 20, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.8 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => select(id)}
                  className="flex items-center gap-3 pr-4 pl-3 h-12 rounded-2xl bg-card border border-border shadow-xl"
                >
                  <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center text-white', color)}>
                    <Icon size={16} />
                  </div>
                  <span className="text-sm font-medium text-foreground whitespace-nowrap">{label}</span>
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
        transition={{ duration: 0.2 }}
        className="fixed bottom-24 right-5 w-14 h-14 rounded-2xl bg-primary text-white shadow-lg shadow-primary/30 flex items-center justify-center z-30"
      >
        <Plus size={26} strokeWidth={2.5} />
      </motion.button>
    </>
  )
}
