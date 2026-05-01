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
              'bg-card/85 backdrop-blur-3xl rounded-t-3xl shadow-2xl',
              'border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]',
              'max-h-[90svh] flex flex-col'
            )}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            /* ui-animation: asymmetric timing — enter feels weighty/physical, exit snaps away fast */
            exit={{ y: '100%', transition: { duration: 0.25, ease: [0.32, 0.72, 0, 1] } }}
            transition={{ type: 'spring', duration: 0.45, bounce: 0.15 }}
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
