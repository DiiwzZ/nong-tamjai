import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Search, CheckCircle2, Archive as ArchiveIcon, X, ClipboardList, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { TaskCard } from '@/components/tasks/TaskCard'
import { TaskForm } from '@/components/tasks/TaskForm'
import { Confetti } from '@/components/ui/Confetti'
import { QuickAddFAB } from '@/components/ui/QuickAdd'
import { TaskSkeleton } from '@/components/ui/Skeleton'
import { Archive } from '@/pages/Archive'
import { cn } from '@/lib/utils'
import { useStore } from '@/store/useStore'

const FILTERS = ['ทั้งหมด', 'สูง', 'กลาง', 'ต่ำ']
const PRIORITY_MAP = { สูง: 'high', กลาง: 'medium', ต่ำ: 'low' }

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center gap-4 py-20 text-center"
    >
      <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
        <ClipboardList size={36} className="text-primary" />
      </div>
      <div>
        <p className="font-semibold text-foreground">ยังไม่มีงานเลย น้องว่างงานแระ</p>
        <p className="text-sm text-muted-foreground mt-1">กด + ให้น้องจดงานแรก</p>
      </div>
    </motion.div>
  )
}

export function Tasks() {
  const { tasks, categories, archiveTask, darkMode, update } = useStore()
  const [formOpen, setFormOpen] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [filter, setFilter] = useState('ทั้งหมด')
  const [showCompleted, setShowCompleted] = useState(false)
  const [showArchivePage, setShowArchivePage] = useState(false)
  const [confetti, setConfetti] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => { const t = setTimeout(() => setLoading(false), 400); return () => clearTimeout(t) }, [])

  const triggerConfetti = (e) => {
    const rect = e.currentTarget?.getBoundingClientRect?.()
    setConfetti({ x: rect?.left ?? window.innerWidth / 2, y: rect?.top ?? window.innerHeight / 2 })
    setTimeout(() => setConfetti(null), 800)
  }

  const active = useMemo(() => {
    let list = tasks.filter((t) => t.status === 'active')
    if (filter !== 'ทั้งหมด') list = list.filter((t) => t.priority === PRIORITY_MAP[filter])
    if (search) list = list.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))
    return list.sort((a, b) => {
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return new Date(a.dueDate) - new Date(b.dueDate)
    })
  }, [tasks, filter, search])

  const completed = useMemo(() => tasks.filter((t) => t.status === 'completed'), [tasks])
  const archived = useMemo(() => tasks.filter((t) => t.status === 'archived'), [tasks])

  const handleTap = (task) => {
    setEditTask(task)
    setFormOpen(true)
  }

  const openNew = () => {
    setEditTask(null)
    setFormOpen(true)
  }

  // Group active tasks by date
  const groups = useMemo(() => {
    const today = new Date().toDateString()
    const tomorrow = new Date(Date.now() + 86400000).toDateString()

    const overdue = active.filter((t) => t.dueDate && new Date(t.dueDate) < new Date())
    const todayTasks = active.filter((t) => t.dueDate && new Date(t.dueDate).toDateString() === today && !overdue.includes(t))
    const tomorrowTasks = active.filter((t) => t.dueDate && new Date(t.dueDate).toDateString() === tomorrow)
    const upcoming = active.filter((t) => {
      if (!t.dueDate) return false
      const d = new Date(t.dueDate)
      return d.toDateString() !== today && d.toDateString() !== tomorrow && d > new Date()
    })
    const noDue = active.filter((t) => !t.dueDate)

    return [
      overdue.length && { label: 'เกินกำหนด', tasks: overdue, overdue: true },
      todayTasks.length && { label: 'วันนี้', tasks: todayTasks },
      tomorrowTasks.length && { label: 'พรุ่งนี้', tasks: tomorrowTasks },
      upcoming.length && { label: 'กำลังจะมาถึง', tasks: upcoming },
      noDue.length && { label: 'ไม่มีกำหนด', tasks: noDue },
    ].filter(Boolean)
  }, [active])

  if (showArchivePage) return <Archive onBack={() => setShowArchivePage(false)} />

  return (
    <div className="flex flex-col h-full">
      {confetti && <Confetti trigger={true} x={confetti.x} y={confetti.y} />}

      {/* Header */}
      <div className="px-5 pb-3 bg-background sticky top-0 z-20 header-safe-top">
        {/* top row: greeting + actions */}
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-0.5">
              {new Date().toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <h1 className="text-2xl font-bold text-foreground leading-tight">
              {active.length > 0
                ? <>มี <span className="text-primary">{active.length} งาน</span><br />รอน้องจัดการ</>
                : <>น้องว่าง<br />ไม่มีงานเลย 🎉</>
              }
            </h1>
          </div>
          <div className="flex items-center gap-1.5 mt-1">
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => setShowArchivePage(true)}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-muted text-muted-foreground"
            >
              <ArchiveIcon size={17} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => setSearchOpen((v) => !v)}
              className={cn(
                'w-9 h-9 rounded-xl flex items-center justify-center transition-colors',
                searchOpen ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
              )}
            >
              <Search size={17} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => update({ darkMode: !darkMode })}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-muted text-muted-foreground"
            >
              <motion.div key={darkMode ? 'moon' : 'sun'} initial={{ rotate: -30, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} transition={{ duration: 0.2 }}>
                {darkMode ? <Sun size={17} /> : <Moon size={17} />}
              </motion.div>
            </motion.button>
          </div>
        </div>

        {/* search bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-3"
            >
              <div className="relative mt-2">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ค้นหางาน..."
                  className="w-full h-11 pl-10 pr-9 rounded-2xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X size={14} className="text-muted-foreground" />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Priority filter pills */}
        <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
          {FILTERS.map((f) => {
            const isActive = filter === f
            const colors = {
              'ทั้งหมด': 'bg-primary shadow-primary/30',
              'สูง':     'bg-red-500 shadow-red-500/30',
              'กลาง':    'bg-amber-500 shadow-amber-500/30',
              'ต่ำ':     'bg-emerald-500 shadow-emerald-500/30',
            }
            return (
              <motion.button
                key={f}
                onClick={() => setFilter(f)}
                whileTap={{ scale: 0.93 }}
                className={cn(
                  'flex-shrink-0 px-4 py-1.5 rounded-full text-[13px] font-bold transition-all duration-200',
                  isActive
                    ? `${colors[f]} text-white shadow-lg`
                    : 'bg-muted text-muted-foreground border border-border/60'
                )}
              >
                {f}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 safe-bottom">
        {loading ? (
          <>{[0,1,2].map((i) => <TaskSkeleton key={i} />)}</>
        ) : groups.length === 0 && completed.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {groups.map((group) => (
              <div key={group.label} className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className={cn(
                    'text-[13px] font-bold tracking-wide',
                    group.overdue ? 'text-destructive' : 'text-foreground'
                  )}>
                    {group.label}
                  </span>
                  <span className={cn(
                    'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                    group.overdue
                      ? 'bg-destructive/15 text-destructive'
                      : 'bg-muted text-muted-foreground'
                  )}>
                    {group.tasks.length}
                  </span>
                </div>
                <AnimatePresence>
                  {group.tasks.map((task, i) => (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.25 }}
                    >
                      <TaskCard task={task} onTap={handleTap} categories={categories} onComplete={triggerConfetti} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ))}

            {/* Completed section */}
            {completed.length > 0 && (
              <div className="mb-5">
                <button
                  onClick={() => setShowCompleted((v) => !v)}
                  className="flex items-center gap-2 mb-3 text-muted-foreground"
                >
                  <CheckCircle2 size={14} />
                  <span className="text-xs font-semibold uppercase tracking-wider">
                    เสร็จแล้ว ({completed.length})
                  </span>
                  <span className="text-[10px] ml-auto">{showCompleted ? '▲' : '▼'}</span>
                </button>
                <AnimatePresence>
                  {showCompleted && completed.map((task) => (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <TaskCard task={task} onTap={handleTap} categories={categories} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </>
        )}
      </div>

      <QuickAddFAB onSelect={(type) => { if (type === 'task') openNew() }} />

      <TaskForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditTask(null) }}
        task={editTask}
      />
    </div>
  )
}
