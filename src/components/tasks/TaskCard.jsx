import { useState } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'motion/react'
import { Check, Trash2, Calendar } from 'lucide-react'
import { cn, formatDate, isOverdue, daysUntil } from '@/lib/utils'
import { useStore } from '@/store/useStore'

/* Vivid accent colors — not muted tints */
const PRIORITY_ACCENT = {
  high:   { color: '#ef4444', label: 'สูง',  textClass: 'text-red-400' },
  medium: { color: '#f59e0b', label: 'กลาง', textClass: 'text-amber-400' },
  low:    { color: '#10b981', label: 'ต่ำ',  textClass: 'text-emerald-400' },
}

const SPRING_SNAPPY = { type: 'spring', stiffness: 500, damping: 40 }
const SPRING_BOUNCY = { type: 'spring', stiffness: 400, damping: 22 }

export function TaskCard({ task, onTap, categories, onComplete }) {
  const { toggleTaskComplete, deleteTask } = useStore()
  const [dragging, setDragging] = useState(false)
  const x = useMotionValue(0)

  /* Swipe-to-delete affordance */
  const deleteOpacity = useTransform(x, [-90, -30], [1, 0])
  const deleteScale   = useTransform(x, [-90, -50], [1, 0.8])

  const accent   = PRIORITY_ACCENT[task.priority] || PRIORITY_ACCENT.medium
  const category = categories?.find((c) => c.id === task.categoryId)
  const overdue  = isOverdue(task.dueDate) && task.status === 'active'
  const days     = daysUntil(task.dueDate)
  const isDone   = task.status === 'completed'

  const dueLabel = () => {
    if (!task.dueDate) return null
    if (overdue)    return 'เกินกำหนด'
    if (days === 0) return 'วันนี้'
    if (days === 1) return 'พรุ่งนี้'
    return formatDate(task.dueDate)
  }

  /* Velocity-based dismissal: fast flick OR drag far enough */
  const handleDragEnd = (_, info) => {
    setDragging(false)
    if (info.velocity.x < -300 || info.offset.x < -60) {
      animate(x, -120, { ...SPRING_SNAPPY, onComplete: () => deleteTask(task.id) })
    } else {
      animate(x, 0, SPRING_SNAPPY)
    }
  }

  const handleComplete = (e) => {
    e.stopPropagation()
    if (task.status === 'active') onComplete?.(e)
    toggleTaskComplete(task.id)
  }

  if (task.status === 'archived') return null

  return (
    <div className="relative overflow-hidden rounded-2xl mb-2.5">

      {/* ── Delete backdrop ── */}
      <motion.div
        style={{ opacity: deleteOpacity, scale: deleteScale }}
        className="absolute inset-y-0 right-0 w-20 flex items-center justify-center bg-destructive rounded-2xl"
      >
        <Trash2 size={18} className="text-white" />
      </motion.div>

      {/* ── Card ── */}
      <motion.div
        drag="x"
        dragConstraints={{ right: 0 }}
        dragElastic={{ left: 0.08, right: 0 }}
        style={{
          x,
          /* Left accent border: vivid priority color */
          borderLeftColor: isDone ? 'var(--color-border)' : accent.color,
        }}
        onDragStart={() => setDragging(true)}
        onDragEnd={handleDragEnd}
        onClick={() => !dragging && onTap?.(task)}
        whileTap={{ scale: 0.982 }}
        className={cn(
          'relative cursor-pointer select-none',
          'rounded-2xl',
          /* Left border accent, other borders default */
          'border-l-[3px] border-t border-r border-b border-border',
          'bg-card',
          isDone && 'opacity-40'
        )}
      >
        <div className="px-4 py-3.5 flex items-center gap-3">

          {/* ── Content ── */}
          <div className="flex-1 min-w-0">

            {/* Priority label + category badge */}
            {!isDone && (
              <div className="flex items-center gap-2 mb-1.5">
                <span className={cn(
                  'text-[10px] font-black uppercase tracking-[0.09em]',
                  accent.textClass
                )}>
                  {accent.label}
                </span>
                {category && (
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
                    style={{ backgroundColor: category.color + '22', color: category.color }}
                  >
                    {category.label}
                  </span>
                )}
              </div>
            )}

            {/* Title */}
            <p className={cn(
              'text-[15px] font-semibold leading-snug text-foreground',
              isDone && 'line-through text-muted-foreground'
            )}>
              {task.title}
            </p>

            {/* Note */}
            {task.note && (
              <p className="text-[12px] text-muted-foreground mt-1 line-clamp-1 leading-relaxed">
                {task.note}
              </p>
            )}

            {/* Due date */}
            {task.dueDate && (
              <div className={cn(
                'flex items-center gap-1.5 mt-2',
                overdue ? 'text-destructive' : 'text-muted-foreground'
              )}>
                <Calendar size={11} className="flex-shrink-0" />
                <span className="text-[11px] font-medium">{dueLabel()}</span>
              </div>
            )}
          </div>

          {/* ── Checkbox — 44×44 touch target ── */}
          <button
            onClick={handleComplete}
            className="flex-shrink-0 flex items-center justify-center w-11 h-11 -mr-1.5"
            aria-label={isDone ? 'ยกเลิกทำเสร็จ' : 'ทำเสร็จ'}
          >
            <motion.span
              animate={isDone
                ? { backgroundColor: 'hsl(217,91%,60%)', borderColor: 'hsl(217,91%,60%)' }
                : { backgroundColor: 'transparent', borderColor: 'hsl(228,16%,22%)' }
              }
              transition={SPRING_SNAPPY}
              className="w-6 h-6 rounded-full border-2 flex items-center justify-center"
            >
              <AnimatePresence mode="wait">
                {isDone && (
                  <motion.span
                    key="check"
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                    transition={SPRING_BOUNCY}
                  >
                    <Check size={12} strokeWidth={3} className="text-white" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.span>
          </button>

        </div>
      </motion.div>
    </div>
  )
}
