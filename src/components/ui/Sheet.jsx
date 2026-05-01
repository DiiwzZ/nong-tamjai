import { useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Sheet({ open, onClose, children, title }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className={cn(
              'fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50',
              'bg-card/80 backdrop-blur-2xl rounded-t-2xl shadow-2xl border border-border/50',
              'max-h-[90svh] flex flex-col'
            )}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0, bottom: 0.3 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 80) onClose()
            }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>

            {title && (
              <div className="flex items-center justify-between px-5 py-3 border-b border-border">
                <h2 className="text-base font-semibold text-foreground">{title}</h2>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            )}

            <div className="overflow-y-auto flex-1 no-scrollbar">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
