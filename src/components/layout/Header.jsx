import { Moon, Sun } from 'lucide-react'
import { motion } from 'motion/react'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'

export function Header({ title, rightAction }) {
  const { darkMode, update } = useStore()

  return (
    <div className="flex items-center justify-between px-5 pb-4 bg-background sticky top-0 z-20 header-safe-top">
      <h1 className="text-xl font-bold text-foreground tracking-tight">{title}</h1>
      <div className="flex items-center gap-1.5">
        {rightAction}
        <motion.button
          whileTap={{ scale: 0.85 }}
          onClick={() => update({ darkMode: !darkMode })}
          className={cn(
            'w-9 h-9 rounded-xl flex items-center justify-center transition-colors',
            'bg-muted text-muted-foreground hover:text-foreground'
          )}
        >
          <motion.div
            key={darkMode ? 'moon' : 'sun'}
            initial={{ rotate: -30, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {darkMode ? <Sun size={17} /> : <Moon size={17} />}
          </motion.div>
        </motion.button>
      </div>
    </div>
  )
}
