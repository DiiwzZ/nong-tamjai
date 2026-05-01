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
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-[402px] z-30 nav-safe">
      {/* nav card — แนบกับ home indicator พอดี ไม่มี mb */}
      <div className="mx-3 bg-card/88 backdrop-blur-2xl border border-white/6 rounded-[1.7rem] shadow-2xl shadow-black/20 dark:shadow-black/60">
        <div className="flex items-center justify-around px-2.5 py-1.5">
          {tabs.map(({ id, label, icon: Icon }) => {
            const isActive = active === id
            return (
              <button
                key={id}
                onClick={() => onChange(id)}
                aria-label={label}
                className={cn(
                  'relative flex flex-col items-center gap-1.5 px-5 py-3 rounded-[1.1rem] transition-all duration-200 select-none flex-1',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-primary/12 rounded-[1.1rem]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.8}
                  className="relative z-10 transition-all duration-200"
                />
                <span className={cn(
                  'relative z-10 text-[11px] font-bold tracking-wide transition-all duration-200',
                  isActive ? 'opacity-100' : 'opacity-40'
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
