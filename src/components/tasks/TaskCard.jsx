import { useState } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'motion/react'
import { Check, Trash2 } from 'lucide-react'
import { cn, formatDate, isOverdue, daysUntil } from '@/lib/utils'
import { useStore } from '@/store/useStore'

const PRIORITY_PILL = {
  high:   { label: 'สูง',   bg: 'bg-red-500',       text: 'text-white' },
  medium: { label: 'กลาง',  bg: 'bg-amber-500',     text: 'text-white' },
  low:    { label: 'ต่ำ',   bg: 'bg-emerald-500',   text: 'text-white' },
}

export function TaskCard({ task, onTap, categories, onComplete }) {
  const { toggleTaskComplete, deleteTask } = useStore()
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
    const date = new Date(task.dueDate)
    const time = date.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
    })
    if (overdue) return 'เกินกำหนด'
    if (days === 0) return `วันนี้ ${time}`
    if (days === 1) return `พรุ่งนี้ ${time}`
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
    toggleTaskComplete(task.id)
  }

  if (task.status === 'archived') return null

  return (
    <div className="relative overflow-hidden rounded-[22px] mb-3.5">
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
          'relative rounded-[22px] px-4 py-4 cursor-pointer select-none min-h-[104px]',
          'bg-card border border-border/80 shadow-[0_10px_24px_-18px_rgba(0,0,0,0.9)]',
          isDone && 'opacity-70'
        )}
      >
        <div className="flex items-start gap-3.5">
          <button
            onClick={handleComplete}
            className={cn(
              'mt-0.5 w-6 h-6 rounded-full border flex-shrink-0 flex items-center justify-center transition-all duration-200',
              isDone
                ? 'bg-primary border-primary shadow-[0_0_0_4px_rgba(59,130,246,0.12)]'
                : 'border-border/80 hover:border-primary/60 bg-background/25'
            )}
          >
            {isDone && <Check size={12} strokeWidth={3} className="text-white" />}
          </button>

          <div className="flex-1 min-w-0">
            {task.priority && !isDone && (
              <span className={cn(
                'inline-flex items-center gap-1 text-[10px] font-bold px-2 py-[3px] rounded-full mb-1.5 shadow-sm',
                pill.bg, pill.text
              )}>
                {task.priority === 'high' && <span className="text-[9px]">•</span>}
                {pill.label}
              </span>
            )}

            <p className={cn(
              'text-[15px] font-semibold leading-snug text-foreground tracking-[-0.015em]',
              isDone && 'line-through text-muted-foreground'
            )}>
              {task.title}
            </p>

            {task.note && (
              <p className="text-[12px] text-muted-foreground/90 mt-0.5 line-clamp-1">
                {task.note}
              </p>
            )}

            <div className="flex items-center justify-between mt-2.5">
              <div className="flex items-center gap-2">
                {task.dueDate && (
                  <span className={cn(
                    'text-[11px] font-medium tabular-nums',
                    overdue ? 'text-destructive' : 'text-muted-foreground'
                  )}>
                    {dueLabelShort()}
                  </span>
                )}
              </div>

              {category && (
                <span
                  className="text-[10px] font-semibold px-2.5 py-[3px] rounded-full"
                  style={{
                    backgroundColor: category.color + '20',
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
