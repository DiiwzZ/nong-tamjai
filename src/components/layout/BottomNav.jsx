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
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-30 nav-safe">
      {/* nav card — แนบกับ home indicator พอดี ไม่มี mb */}
      <div className="mx-3 bg-card/95 backdrop-blur-2xl border border-border/80 rounded-2xl shadow-2xl shadow-black/20 dark:shadow-black/60">
        <div className="flex items-center justify-around px-2 py-1">
          {tabs.map(({ id, label, icon: Icon }) => {
            const isActive = active === id
            return (
              <button
                key={id}
                onClick={() => onChange(id)}
                className={cn(
                  'relative flex flex-col items-center gap-1 px-5 py-3 rounded-xl transition-all duration-200 select-none flex-1',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-pill"
                    className="absolute inset-0 bg-primary/10 rounded-xl"
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
