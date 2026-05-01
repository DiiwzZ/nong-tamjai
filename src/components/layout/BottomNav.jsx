import { motion } from 'motion/react'
import { CheckSquare, CreditCard, LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'

const TABS = [
  { id: 'tasks',         icon: CheckSquare,     label: 'งาน'  },
  { id: 'subscriptions', icon: CreditCard,      label: 'จ่าย' },
  { id: 'dashboard',     icon: LayoutDashboard, label: 'สรุป' },
]

export function BottomNav({ active, onChange }) {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-30 nav-safe">
      <div className="mx-3 mb-2 bg-card/92 backdrop-blur-2xl border border-border rounded-2xl shadow-[0_-1px_0_rgba(255,255,255,0.04),0_12px_40px_-8px_rgba(0,0,0,0.5)]">
        <div className="flex items-center">
          {TABS.map(({ id, label, icon: Icon }) => {
            const isActive = active === id
            return (
              <button
                key={id}
                onClick={() => onChange(id)}
                className="relative flex-1 flex flex-col items-center justify-center py-3 gap-1 select-none"
              >
                {/* Sliding pill */}
                {isActive && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-x-4 inset-y-1.5 rounded-xl bg-primary/12"
                    transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                  />
                )}

                <motion.span
                  animate={{ scale: isActive ? 1.1 : 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                  className={cn(
                    'relative z-10 transition-colors duration-150',
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  <Icon size={22} strokeWidth={isActive ? 2.2 : 1.8} />
                </motion.span>

                <span className={cn(
                  'relative z-10 text-[11px] font-bold transition-colors duration-150',
                  isActive ? 'text-primary' : 'text-muted-foreground opacity-50'
                )}>
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
