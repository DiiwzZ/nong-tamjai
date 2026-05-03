import { useState } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'motion/react'
import { Trash2, Check } from 'lucide-react'
import { formatDate, isOverdue, daysUntil } from '@/lib/utils'
import { useStore } from '@/store/useStore'

const PRIORITY_COLOR = {
  high:   '#ef4444',
  medium: '#f59e0b',
  low:    '#22c55e',
}

export function TaskCard({ task, onTap, categories, onComplete }) {
  const { completeTask, deleteTask } = useStore()
  const [dragging, setDragging] = useState(false)
  const x = useMotionValue(0)
  const deleteOpacity = useTransform(x, [-90, -24], [1, 0])

  const category = categories?.find((c) => c.id === task.categoryId)
  const overdue = isOverdue(task.dueDate) && task.status === 'active'
  const days = daysUntil(task.dueDate)
  const isDone = task.status === 'completed'
  const priorityColor = PRIORITY_COLOR[task.priority] || '#3b3b50'

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
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 18, marginBottom: 10 }}>
      {/* Delete zone */}
      <div style={{
        position: 'absolute', inset: 'auto 0 auto auto',
        height: '100%', display: 'flex', alignItems: 'center', paddingRight: 14,
      }}>
        <motion.button
          onClick={handleDelete}
          style={{
            width: 44, height: 44, borderRadius: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: '#ef4444', border: 'none', cursor: 'pointer',
            opacity: deleteOpacity,
          }}
        >
          <Trash2 size={17} color="#fff" />
        </motion.button>
      </div>

      {/* Card */}
      <motion.div
        drag="x"
        dragConstraints={{ right: 0 }}
        dragElastic={{ left: 0.08, right: 0 }}
        style={{
          x,
          position: 'relative',
          background: overdue ? 'rgba(239,68,68,0.05)' : '#1a1a22',
          border: `1px solid ${overdue ? 'rgba(239,68,68,0.22)' : '#252530'}`,
          borderRadius: 18,
          opacity: isDone ? 0.42 : 1,
          overflow: 'hidden',
        }}
        onDragStart={() => setDragging(true)}
        onDragEnd={handleDragEnd}
        onClick={() => !dragging && onTap?.(task)}
        className="cursor-pointer select-none"
      >
        {/* Priority bar */}
        {!isDone && (
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
            background: overdue ? '#ef4444' : priorityColor,
            borderRadius: '18px 0 0 18px',
          }} />
        )}

        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px 12px 20px', gap: 4 }}>
          {/* Checkbox — 44×44 hit area */}
          <button
            onClick={handleComplete}
            style={{
              flexShrink: 0, width: 44, height: 44, marginLeft: -6,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'none', border: 'none', cursor: 'pointer',
            }}
          >
            <div style={{
              width: 22, height: 22, borderRadius: '50%',
              border: isDone ? 'none' : '2px solid #3b3b50',
              background: isDone ? '#3b82f6' : 'transparent',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.18s',
            }}>
              {isDone && <Check size={11} strokeWidth={3} color="#fff" />}
            </div>
          </button>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize: 17, fontWeight: 600, lineHeight: 1.3,
              color: isDone ? '#6b6b88' : '#f0f0f8',
              textDecoration: isDone ? 'line-through' : 'none',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {task.title}
            </p>

            {(task.dueDate || category) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                {task.dueDate && (
                  <span style={{
                    fontSize: 12, fontWeight: 500,
                    color: overdue ? '#f87171' : '#6b6b88',
                  }}>
                    {overdue
                      ? '⚠ เกินกำหนด'
                      : days === 0
                      ? 'วันนี้'
                      : days === 1
                      ? 'พรุ่งนี้'
                      : formatDate(task.dueDate)}
                  </span>
                )}
                {task.dueDate && category && (
                  <span style={{ fontSize: 12, color: '#3b3b50' }}>·</span>
                )}
                {category && (
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '1px 8px', borderRadius: 7,
                    background: `${category.color}22`, color: category.color,
                  }}>
                    {category.label}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
