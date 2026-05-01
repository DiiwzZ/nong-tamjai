import { useState, useRef } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'motion/react'
import { Check, Trash2, ChevronRight } from 'lucide-react'
import { cn, PRIORITY, formatDate, isOverdue, daysUntil } from '@/lib/utils'
import { useStore } from '@/store/useStore'

export function TaskCard({ task, onTap, categories, onComplete }) {
  const { completeTask, deleteTask } = useStore()
  const [dragging, setDragging] = useState(false)
  const x = useMotionValue(0)
  const opacity = useTransform(x, [-80, -20], [1, 0])
  const actionOpacity = useTransform(x, [-80, -30], [1, 0])

  const priority = PRIORITY[task.priority] || PRIORITY.medium
  const category = categories?.find((c) => c.id === task.categoryId)
  const overdue = isOverdue(task.dueDate) && task.status === 'active'
  const days = daysUntil(task.dueDate)

  const handleDragEnd = (_, info) => {
    setDragging(false)
    if (info.offset.x < -60) {
      animate(x, -100, { duration: 0.2 })
    } else {
      animate(x, 0, { type: 'spring', stiffness: 400, damping: 30 })
    }
  }

  const handleComplete = (e) => {
    e.stopPropagation()
    if (task.status === 'active') onComplete?.(e)
    completeTask(task.id)
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    deleteTask(task.id)
  }

  if (task.status === 'archived') return null

  return (
    <div className="relative overflow-hidden rounded-xl mb-2">
      {/* Action buttons behind */}
      <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-2">
        <motion.button
          style={{ opacity: actionOpacity }}
          onClick={handleComplete}
          className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-500 text-white"
        >
          <Check size={20} />
        </motion.button>
        <motion.button
          style={{ opacity: actionOpacity }}
          onClick={handleDelete}
          className="flex items-center justify-center w-12 h-12 rounded-xl bg-destructive text-white"
        >
          <Trash2 size={18} />
        </motion.button>
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ right: 0 }}
        dragElastic={{ left: 0.1, right: 0 }}
        style={{ x }}
        onDragStart={() => setDragging(true)}
        onDragEnd={handleDragEnd}
        onClick={() => !dragging && onTap?.(task)}
        className={cn(
          'relative rounded-xl p-4 cursor-pointer select-none',
          'border transition-colors duration-150',
          task.status === 'completed'
            ? 'bg-muted/50 border-border opacity-60'
            : [priority.bg, priority.border]
        )}
      >
        <div className="flex items-start gap-3">
          <button
            onClick={handleComplete}
            className={cn(
              'mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all',
              task.status === 'completed'
                ? 'bg-green-500 border-green-500'
                : 'border-current opacity-50'
            )}
          >
            {task.status === 'completed' && <Check size={11} strokeWidth={3} className="text-white" />}
          </button>

          <div className="flex-1 min-w-0">
            <p className={cn(
              'text-sm font-medium leading-snug',
              task.status === 'completed' ? 'line-through text-muted-foreground' : priority.text
            )}>
              {task.title}
            </p>

            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {category && (
                <span
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded-md text-white"
                  style={{ backgroundColor: category.color }}
                >
                  {category.label}
                </span>
              )}
              {task.dueDate && (
                <span className={cn(
                  'text-[10px] font-medium',
                  overdue ? 'text-destructive' : 'text-muted-foreground'
                )}>
                  {overdue ? 'เกินกำหนด' : days === 0 ? 'วันนี้' : days === 1 ? 'พรุ่งนี้' : formatDate(task.dueDate)}
                </span>
              )}
              {task.note && (
                <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                  {task.note}
                </span>
              )}
            </div>
          </div>

          <ChevronRight size={16} className="text-muted-foreground flex-shrink-0 mt-0.5" />
        </div>
      </motion.div>
    </div>
  )
}
