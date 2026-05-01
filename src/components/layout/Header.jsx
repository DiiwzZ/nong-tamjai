import { Moon, Sun } from 'lucide-react'
import { motion } from 'motion/react'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'

export function Header({ title, rightAction }) {
  const { darkMode, update } = useStore()

  return (
    <div className="flex items-end justify-between px-5 pb-3 bg-background sticky top-0 z-20 header-safe-top">
      <h1 className="text-3xl font-black tracking-tighter text-foreground leading-none pb-0.5">{title}</h1>
      <div className="flex items-center gap-1.5 pb-0.5">
        {rightAction}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => update({ darkMode: !darkMode })}
          className={cn(
            'w-9 h-9 rounded-xl flex items-center justify-center transition-colors',
            'bg-muted text-muted-foreground'
          )}
        >
          <motion.div
            key={darkMode ? 'sun' : 'moon'}
            initial={{ rotate: -30, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </motion.div>
        </motion.button>
      </div>
    </div>
  )
}
