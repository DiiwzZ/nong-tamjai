import { motion } from 'motion/react'
import { CheckSquare, CreditCard, LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { id: 'tasks', label: 'งาน', icon: CheckSquare },
  { id: 'subscriptions', label: 'น้องเตือน', icon: CreditCard },
  { id: 'dashboard', label: 'ภาพรวม', icon: LayoutDashboard },
]

export function BottomNav({ active, onChange }) {
  return (
    <nav className="fixed bottom-0 left-1/2 z-30 w-[calc(100%-2rem)] max-w-[402px] -translate-x-1/2 nav-safe">
      <div className="mx-3 rounded-[1.9rem] border border-white/7 bg-[linear-gradient(180deg,rgba(30,33,49,0.94),rgba(21,23,35,0.98))] shadow-[0_28px_60px_-36px_rgba(0,0,0,1)] backdrop-blur-2xl">
        <div className="flex items-center justify-around px-2.5 py-2">
          {tabs.map(({ id, label, icon: Icon }) => {
            const isActive = active === id
            return (
              <button
                key={id}
                onClick={() => onChange(id)}
                aria-label={label}
                className={cn(
                  'relative flex flex-1 select-none flex-col items-center gap-1.5 rounded-[1.2rem] px-5 py-3 transition-all duration-200',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-[1.2rem] border border-primary/20 bg-primary/12 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                {isActive && (
                  <motion.div
                    layoutId="nav-top-line"
                    className="absolute left-1/2 top-1 h-1 w-10 -translate-x-1/2 rounded-full bg-primary"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className="relative z-10 transition-all duration-200"
                />
                <span
                  className={cn(
                    'relative z-10 text-[11px] font-bold tracking-[0.08em] transition-all duration-200',
                    isActive ? 'opacity-100' : 'opacity-40'
                  )}
                >
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
