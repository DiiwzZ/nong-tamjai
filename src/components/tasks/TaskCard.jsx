import { useState } from 'react'
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'motion/react'
import { Check, Trash2 } from 'lucide-react'
import { cn, formatDate, isOverdue, daysUntil } from '@/lib/utils'
import { useStore } from '@/store/useStore'

/* taste-skill: soft-tinted priority pills, no solid fill, no emoji */
const PRIORITY_PILL = {
  high:   { label: 'สูง',  bg: 'bg-red-500/12',     text: 'text-red-400',     dot: 'bg-red-400' },
  medium: { label: 'กลาง', bg: 'bg-amber-500/12',   text: 'text-amber-400',   dot: 'bg-amber-400' },
  low:    { label: 'ต่ำ',  bg: 'bg-emerald-500/12', text: 'text-emerald-400', dot: 'bg-emerald-400' },
}

/* ui-animation spring presets */
const SPRING_SNAPPY  = { type: 'spring', stiffness: 500, damping: 40 }
const SPRING_BOUNCY  = { type: 'spring', stiffness: 400, damping: 22 }

export function TaskCard({ task, onTap, categories, onComplete }) {
  const { completeTask, deleteTask } = useStore()
  const [dragging, setDragging] = useState(false)
  const x = useMotionValue(0)

  /* ui-animation: opacity fades in from -90 → -30 to give visual drag feedback */
  const deleteOpacity = useTransform(x, [-90, -30], [1, 0])
  const deleteScale   = useTransform(x, [-90, -50], [1, 0.8])

  const pill     = PRIORITY_PILL[task.priority] || PRIORITY_PILL.medium
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

  /* ui-animation: velocity-based dismissal — fast flick triggers delete
     even if offset < 60px (gesture-drag.md: velocity > 0.3 px/ms) */
  const handleDragEnd = (_, info) => {
    setDragging(false)
    const fastFlick = info.velocity.x < -300
    const farEnough = info.offset.x < -60
    if (fastFlick || farEnough) {
      animate(x, -120, {
        ...SPRING_SNAPPY,
        onComplete: () => deleteTask(task.id),
      })
    } else {
      animate(x, 0, SPRING_SNAPPY)
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

      {/* ── swipe-to-delete backdrop ── */}
      <motion.div
        style={{ opacity: deleteOpacity, scale: deleteScale }}
        className="absolute inset-y-0 right-0 w-20 flex items-center justify-center bg-destructive rounded-2xl"
      >
        <Trash2 size={18} className="text-white" />
      </motion.div>

      {/* ── card ── */}
      <motion.div
        drag="x"
        dragConstraints={{ right: 0 }}
        dragElastic={{ left: 0.08, right: 0 }}
        style={{ x }}
        onDragStart={() => setDragging(true)}
        onDragEnd={handleDragEnd}
        onClick={() => !dragging && onTap?.(task)}
        whileTap={{ scale: 0.983 }}
        /* taste-skill: liquid glass — 1px inner highlight simulates physical edge refraction */
        className={cn(
          'relative rounded-2xl px-4 py-4 cursor-pointer select-none',
          'bg-card border border-border',
          'shadow-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]',
          isDone && 'opacity-45'
        )}
      >
        <div className="flex items-center gap-3">

          {/* ── content column ── */}
          <div className="flex-1 min-w-0">

            {/* priority pill */}
            {task.priority && !isDone && (
              <div className="mb-1.5">
                <span className={cn(
                  'inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full',
                  pill.bg, pill.text
                )}>
                  <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', pill.dot)} />
                  {pill.label}
                </span>
              </div>
            )}

            {/* title */}
            <p className={cn(
              'text-[15px] font-semibold leading-snug text-foreground',
              isDone && 'line-through text-muted-foreground'
            )}>
              {task.title}
            </p>

            {/* note */}
            {task.note && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1 leading-relaxed">
                {task.note}
              </p>
            )}

            {/* meta row */}
            {(task.dueDate || category) && (
              <div className="flex items-center justify-between mt-2.5">
                {task.dueDate ? (
                  <span className={cn(
                    'text-[11px] font-medium',
                    overdue ? 'text-destructive' : 'text-muted-foreground'
                  )}>
                    {dueLabel()}
                  </span>
                ) : <span />}
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
            )}
          </div>

          {/* ── checkbox — right side, 44×44 touch target (ui-ux-pro-max) ── */}
          <button
            onClick={handleComplete}
            className="flex-shrink-0 flex items-center justify-center w-11 h-11 -mr-1.5"
            aria-label={isDone ? 'ยกเลิกทำเสร็จ' : 'ทำเสร็จ'}
          >
            <motion.span
              animate={isDone
                ? { backgroundColor: 'hsl(217,91%,60%)', borderColor: 'hsl(217,91%,60%)' }
                : { backgroundColor: 'transparent', borderColor: 'hsl(240,8%,20%)' }
              }
              /* ui-animation: spring — "Snappy" preset, no linear easing */
              transition={SPRING_SNAPPY}
              className="w-6 h-6 rounded-full border-2 flex items-center justify-center"
            >
              {/* ui-animation: AnimatePresence — never scale from 0, use 0.5 */}
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
