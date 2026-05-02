import { useState } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'motion/react'
import { Check, Trash2 } from 'lucide-react'
import { cn, formatDate, isOverdue, daysUntil } from '@/lib/utils'
import { useStore } from '@/store/useStore'

const PRIORITY_PILL = {
  high: { label: 'สูง', bg: 'bg-red-500', text: 'text-white' },
  medium: { label: 'กลาง', bg: 'bg-amber-500', text: 'text-white' },
  low: { label: 'ต่ำ', bg: 'bg-emerald-500', text: 'text-white' },
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
    <div className="relative mb-5 overflow-hidden rounded-[24px]">
      <motion.div
        style={{ opacity: deleteOpacity }}
        className="absolute inset-y-0 right-0 flex w-20 items-center justify-center rounded-2xl bg-destructive"
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
          'relative cursor-pointer select-none rounded-[24px] p-[18px]',
          'border border-white/[0.07] bg-card shadow-[0_20px_42px_-26px_rgba(0,0,0,1)]',
          isDone && 'opacity-70'
        )}
      >
        <div className="flex items-start gap-4">
          <button
            onClick={handleComplete}
            aria-label={isDone ? 'ยกเลิกว่างานเสร็จ' : 'ทำเครื่องหมายว่าเสร็จ'}
            className={cn(
              'mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border transition-[border-color,background-color,box-shadow] duration-200',
              isDone
                ? 'border-primary bg-primary shadow-[0_0_0_4px_rgba(59,130,246,0.12)]'
                : 'border-border/80 bg-background/25 hover:border-primary/60'
            )}
          >
            {isDone && <Check size={12} strokeWidth={3} className="text-white" />}
          </button>

          <div className="min-w-0 flex-1">
            {task.priority && !isDone && (
              <span className={cn('mb-2 inline-flex items-center gap-1 rounded-full px-2 py-[3px] text-[10px] font-bold shadow-sm', pill.bg, pill.text)}>
                {task.priority === 'high' && <span className="text-[9px]">!</span>}
                {pill.label}
              </span>
            )}

            <p
              className={cn(
                'text-[15px] font-semibold leading-[1.28] tracking-[-0.015em] text-foreground',
                isDone && 'text-muted-foreground line-through'
              )}
            >
              {task.title}
            </p>

            {task.note && (
              <p className="mt-1 line-clamp-1 text-[12px] text-muted-foreground/90">
                {task.note}
              </p>
            )}

            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {task.dueDate && (
                  <span
                    className={cn(
                      'rounded-full px-2 py-1 text-[11px] font-medium tabular-nums',
                      overdue ? 'text-destructive' : 'text-muted-foreground'
                    )}
                    style={!overdue ? { backgroundColor: 'rgba(255,255,255,0.04)' } : undefined}
                  >
                    {dueLabelShort()}
                  </span>
                )}
              </div>

              {category && (
                <span
                  className="rounded-full px-2.5 py-[3px] text-[10px] font-semibold"
                  style={{
                    backgroundColor: `${category.color}20`,
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
