import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { TaskCard } from '@/components/tasks/TaskCard'
import { TaskForm } from '@/components/tasks/TaskForm'
import { Confetti } from '@/components/ui/Confetti'
import { QuickAddFAB } from '@/components/ui/QuickAdd'
import { TaskSkeleton } from '@/components/ui/Skeleton'
import { PageHeader } from '@/components/layout/PageHeader'
import { useStore } from '@/store/useStore'
import { isOverdue } from '@/lib/utils'

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 20, textAlign: 'center',
      }}
    >
      {/* Icon */}
      <motion.div
        initial={{ scale: 0.75, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.08, type: 'spring', stiffness: 260, damping: 22 }}
        style={{
          width: 84, height: 84, borderRadius: 24,
          background: 'linear-gradient(145deg, rgba(59,130,246,0.16) 0%, rgba(99,102,241,0.08) 100%)',
          border: '1px solid rgba(59,130,246,0.24)',
          boxShadow: '0 0 36px rgba(59,130,246,0.12), inset 0 1px 0 rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" strokeLinecap="round" strokeLinejoin="round">
          {/* Clipboard body */}
          <rect x="7" y="9" width="26" height="28" rx="5.5" stroke="#3b82f6" strokeWidth="1.8"/>
          {/* Top clip bar */}
          <path d="M15 9V7.5A1.5 1.5 0 0 1 16.5 6h7A1.5 1.5 0 0 1 25 7.5V9" stroke="#3b82f6" strokeWidth="1.8"/>
          {/* Check mark (top item done) */}
          <path d="M14 20l3.5 3.5 8.5-8.5" stroke="#3b82f6" strokeWidth="2.2"/>
          {/* Faded lines below */}
          <path d="M14 29h12" stroke="#3b82f6" strokeWidth="1.6" strokeOpacity="0.38"/>
          <path d="M14 33h8" stroke="#3b82f6" strokeWidth="1.6" strokeOpacity="0.2"/>
        </svg>
      </motion.div>

      <div>
        <p style={{ fontSize: 17, fontWeight: 700, color: '#f0f0f8', marginBottom: 6 }}>
          ไม่มีงานค้างอยู่
        </p>
        <p style={{ fontSize: 14, color: '#6b6b88' }}>กดปุ่ม + เพื่อเพิ่ม task ใหม่</p>
      </div>
    </motion.div>
  )
}

export function Tasks({ onTabChange }) {
  const { tasks, categories } = useStore()
  const [formOpen, setFormOpen] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [confetti, setConfetti] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 380)
    return () => clearTimeout(t)
  }, [])

  const triggerConfetti = (e) => {
    const rect = e.currentTarget?.getBoundingClientRect?.()
    setConfetti({ x: rect?.left ?? window.innerWidth / 2, y: rect?.top ?? window.innerHeight / 2 })
    setTimeout(() => setConfetti(null), 800)
  }

  const active = useMemo(() =>
    tasks
      .filter((t) => t.status === 'active')
      .sort((a, b) => {
        const aOv = isOverdue(a.dueDate)
        const bOv = isOverdue(b.dueDate)
        if (aOv && !bOv) return -1
        if (!aOv && bOv) return 1
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return new Date(a.dueDate) - new Date(b.dueDate)
      }),
  [tasks])

  const overdueCount = useMemo(() =>
    active.filter((t) => isOverdue(t.dueDate)).length,
  [active])

  const doneCount = useMemo(() =>
    tasks.filter((t) => t.status === 'completed' || t.status === 'archived').length,
  [tasks])

  const openNew = () => { setEditTask(null); setFormOpen(true) }
  const handleTap = (task) => { setEditTask(task); setFormOpen(true) }

  /* ── Header right slot ── */
  const headerRight = !loading ? (
    <>
      {overdueCount > 0 && (
        <span style={{
          fontSize: 12, fontWeight: 700,
          padding: '4px 10px', borderRadius: 9,
          background: 'rgba(239,68,68,0.13)',
          color: '#f87171',
        }}>
          {overdueCount} เกินกำหนด
        </span>
      )}
      {active.length > 0 && (
        <span style={{
          fontSize: 13, fontWeight: 600,
          padding: '4px 10px', borderRadius: 9,
          background: '#1e1e28',
          color: '#6b6b88',
          border: '1px solid #252530',
        }}>
          {active.length}
        </span>
      )}
    </>
  ) : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {confetti && <Confetti trigger={true} x={confetti.x} y={confetti.y} />}

      {/* Sticky header */}
      <PageHeader title="งาน" right={headerRight} />

      {/* Scrollable content */}
      <div
        className="no-scrollbar"
        style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 140px', display: 'flex', flexDirection: 'column' }}
      >
        {loading ? (
          <>{[0, 1, 2].map((i) => <TaskSkeleton key={i} />)}</>
        ) : active.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <EmptyState />
          </div>
        ) : (
          <AnimatePresence>
            {active.map((task, i) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -6, filter: 'blur(3px)', height: 0, marginBottom: 0 }}
                transition={{ delay: i * 0.05, type: 'spring', stiffness: 350, damping: 28 }}
              >
                <TaskCard
                  task={task}
                  onTap={handleTap}
                  categories={categories}
                  onComplete={triggerConfetti}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* Archive link */}
        {!loading && doneCount > 0 && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            onClick={() => onTabChange?.('archive')}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              width: '100%', padding: '14px 0',
              marginTop: active.length > 0 ? 4 : 28,
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#3b3b50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 8v13H3V8"/><path d="M23 3H1v5h22V3z"/><path d="M10 12h4"/>
            </svg>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#3b3b50' }}>
              งานที่เสร็จแล้ว · {doneCount}
            </span>
          </motion.button>
        )}
      </div>

      <QuickAddFAB onSelect={(type) => {
        if (type === 'task') openNew()
        if (type === 'sub') onTabChange?.('subscriptions')
      }} />

      <TaskForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditTask(null) }}
        task={editTask}
      />
    </div>
  )
}
