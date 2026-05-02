import { CheckSquare, CreditCard, LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  { id: 'tasks', label: 'งาน', icon: CheckSquare },
  { id: 'subscriptions', label: 'Subscription', icon: CreditCard },
  { id: 'dashboard', label: 'ภาพรวม', icon: LayoutDashboard },
]

export function BottomNav({ active, onChange }) {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-30 bg-card/80 backdrop-blur-xl border-t border-border safe-bottom">
      <div className="flex items-center justify-around px-4 pt-2 pb-2">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className={cn(
                'flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all duration-200 select-none',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground'
              )}
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.5 : 1.8}
                className={cn('transition-transform duration-200', isActive && 'scale-110')}
              />
              <span className={cn('text-[10px] font-medium transition-all', isActive ? 'opacity-100' : 'opacity-70')}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
