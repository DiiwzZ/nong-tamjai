import { useState } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'motion/react'
import { Check, Trash2 } from 'lucide-react'
import { cn, formatDate, isOverdue, daysUntil } from '@/lib/utils'
import { useStore } from '@/store/useStore'

const PRIORITY_PILL = {
  high:   { label: 'สูง',   bg: 'bg-red-500',     text: 'text-white' },
  medium: { label: 'กลาง',  bg: 'bg-amber-500',   text: 'text-white' },
  low:    { label: 'ต่ำ',   bg: 'bg-emerald-500', text: 'text-white' },
}

export function TaskCard({ task, onTap, categories, onComplete }) {
  const { completeTask, deleteTask } = useStore()
  const [dragging, setDragging] = useState(false)
  const x = useMotionValue(0)
  const deleteOpacity = useTransform(x, [-90, -30], [1, 0])

  const pill = PRIORITY_PILL[task.priority] || PRIORITY_PILL.medium
  const category = categories?.find((c) => c.id === task.categoryId)
  const overdue = isOverdue(task.dueDate) && task.status === 'active'
  const days = daysUntil(task.dueDate)
  const isDone = task.status === 'completed'

  const dueLabelShort = () => {
    if (!task.dueDate) return null
    if (overdue) return 'เกินกำหนด'
    if (days === 0) return 'วันนี้'
    if (days === 1) return 'พรุ่งนี้'
    return formatDate(task.dueDate)
  }

  const handleDragEnd = (_, info) => {
    setDragging(false)
    if (info.offset.x < -60) {
      animate(x, -100, { duration: 0.15, onComplete: () => deleteTask(task.id) })
    } else {
      animate(x, 0, { type: 'spring', stiffness: 400, damping: 30 })
    }
  }

  const handleComplete = (e) => {
    e.stopPropagation()
    if (task.status === 'active') onComplete?.(e)
    completeTask(task.id)
  }

  if (task.status === 'archived') return null

  return (
    <div className="relative overflow-hidden rounded-2xl mb-3">
      {/* swipe-to-delete bg */}
      <motion.div
        style={{ opacity: deleteOpacity }}
        className="absolute inset-y-0 right-0 w-20 flex items-center justify-center bg-destructive rounded-2xl"
      >
        <Trash2 size={18} className="text-white" />
      </motion.div>

      <motion.div
        drag="x"
        dragConstraints={{ right: 0 }}
        dragElastic={{ left: 0.08, right: 0 }}
        style={{ x }}
        onDragStart={() => setDragging(true)}
        onDragEnd={handleDragEnd}
        onClick={() => !dragging && onTap?.(task)}
        whileTap={{ scale: 0.985 }}
        className={cn(
          'relative rounded-2xl px-4 py-4 cursor-pointer select-none',
          'bg-card border border-border',
          isDone && 'opacity-50'
        )}
      >
        <div className="flex items-start gap-3">

          {/* ── checkbox ── */}
          <button
            onClick={handleComplete}
            className={cn(
              'mt-0.5 w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-200',
              isDone
                ? 'bg-primary border-primary'
                : 'border-border hover:border-primary/60'
            )}
          >
            {isDone && <Check size={12} strokeWidth={3} className="text-white" />}
          </button>

          {/* ── body ── */}
          <div className="flex-1 min-w-0">

            {/* priority pill */}
            {task.priority && !isDone && (
              <span className={cn(
                'inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full mb-1.5',
                pill.bg, pill.text
              )}>
                {task.priority === 'high' && <span className="text-[9px]">⚡</span>}
                {pill.label}
              </span>
            )}

            {/* title */}
            <p className={cn(
              'text-sm font-semibold leading-snug text-foreground',
              isDone && 'line-through text-muted-foreground'
            )}>
              {task.title}
            </p>

            {/* note */}
            {task.note && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {task.note}
              </p>
            )}

            {/* meta row */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                {task.dueDate && (
                  <span className={cn(
                    'text-[11px] font-medium',
                    overdue ? 'text-destructive' : 'text-muted-foreground'
                  )}>
                    {dueLabelShort()}
                  </span>
                )}
              </div>

              {/* category tag — right aligned */}
              {category && (
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
                  style={{
                    backgroundColor: category.color + '22',
                    color: category.color,
                  }}
                >
                  {category.label}
                </span>
              )}
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  )
}
