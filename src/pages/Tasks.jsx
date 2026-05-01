import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Search, Archive as ArchiveIcon, X, Moon, Sun, Sparkles, ChevronDown } from 'lucide-react'
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
const PILL_BG = {
  'ทั้งหมด': 'bg-primary',
  'สูง':     'bg-red-500',
  'กลาง':    'bg-amber-500',
  'ต่ำ':     'bg-emerald-500',
}

/* ── Progress ring ── SVG donut showing done/total ratio */
function ProgressRing({ done, total }) {
  const size = 56, stroke = 4.5
  const r    = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const pct  = total === 0 ? 0 : done / total

  return (
    <div className="relative flex-shrink-0">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" strokeWidth={stroke}
          stroke="var(--color-muted)"
        />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - pct) }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
          stroke="var(--color-primary)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-px">
        <span className="text-[11px] font-black text-foreground leading-none">{done}</span>
        <span className="text-[9px] font-medium text-muted-foreground leading-none">/{total}</span>
      </div>
    </div>
  )
}

/* ── Empty state — floating icon ── */
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 26 }}
      className="flex flex-col items-center justify-center gap-5 py-24 text-center"
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        className="w-24 h-24 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center"
      >
        <Sparkles size={38} className="text-primary" />
      </motion.div>
      <div>
        <p className="text-xl font-black text-foreground tracking-tight">ว่างงานแล้ว</p>
        <p className="text-sm text-muted-foreground mt-1.5 font-medium">กด + เพื่อเพิ่มงานแรก</p>
      </div>
    </motion.div>
  )
}

export function Tasks() {
  const { tasks, categories, darkMode, update } = useStore()
  const [formOpen, setFormOpen]         = useState(false)
  const [editTask, setEditTask]         = useState(null)
  const [search, setSearch]             = useState('')
  const [searchOpen, setSearchOpen]     = useState(false)
  const [filter, setFilter]             = useState('ทั้งหมด')
  const [showCompleted, setShowCompleted] = useState(false)
  const [showArchivePage, setShowArchivePage] = useState(false)
  const [confetti, setConfetti]         = useState(null)
  const [loading, setLoading]           = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400)
    return () => clearTimeout(t)
  }, [])

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
  const nonArchived = useMemo(() => tasks.filter((t) => t.status !== 'archived'), [tasks])

  /* Group active tasks by time bucket */
  const groups = useMemo(() => {
    const today    = new Date().toDateString()
    const tomorrow = new Date(Date.now() + 86400000).toDateString()

    const overdue    = active.filter((t) => t.dueDate && new Date(t.dueDate) < new Date())
    const todayList  = active.filter((t) => t.dueDate && new Date(t.dueDate).toDateString() === today && !overdue.includes(t))
    const tmrwList   = active.filter((t) => t.dueDate && new Date(t.dueDate).toDateString() === tomorrow)
    const upcoming   = active.filter((t) => {
      if (!t.dueDate) return false
      const d = new Date(t.dueDate)
      return d.toDateString() !== today && d.toDateString() !== tomorrow && d > new Date()
    })
    const noDue = active.filter((t) => !t.dueDate)

    return [
      overdue.length   && { label: 'เกินกำหนด',       tasks: overdue,   overdue: true },
      todayList.length && { label: 'วันนี้',           tasks: todayList },
      tmrwList.length  && { label: 'พรุ่งนี้',         tasks: tmrwList },
      upcoming.length  && { label: 'กำลังจะมาถึง',    tasks: upcoming },
      noDue.length     && { label: 'ยังไม่ระบุเวลา',  tasks: noDue },
    ].filter(Boolean)
  }, [active])

  const handleTap = (task) => { setEditTask(task); setFormOpen(true) }
  const openNew   = () => { setEditTask(null); setFormOpen(true) }

  if (showArchivePage) return <Archive onBack={() => setShowArchivePage(false)} />

  return (
    <div className="flex flex-col h-full">
      {confetti && <Confetti trigger={true} x={confetti.x} y={confetti.y} />}

      {/* ══ Sticky Header ══ */}
      <div className="px-5 bg-background sticky top-0 z-20 header-safe-top pb-0">

        {/* Date row + action buttons */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.1em]">
            {new Date().toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <div className="flex items-center gap-1.5">
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => setShowArchivePage(true)}
              className="w-8 h-8 rounded-xl flex items-center justify-center bg-muted text-muted-foreground"
            >
              <ArchiveIcon size={15} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => setSearchOpen((v) => !v)}
              className={cn(
                'w-8 h-8 rounded-xl flex items-center justify-center transition-colors',
                searchOpen ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
              )}
            >
              <Search size={15} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => update({ darkMode: !darkMode })}
              className="w-8 h-8 rounded-xl flex items-center justify-center bg-muted text-muted-foreground"
            >
              <motion.div
                key={darkMode ? 'moon' : 'sun'}
                initial={{ rotate: -30, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {darkMode ? <Sun size={15} /> : <Moon size={15} />}
              </motion.div>
            </motion.button>
          </div>
        </div>

        {/* Hero: big count + progress ring */}
        <div className="flex items-end justify-between mb-4">
          <div>
            <h1 className="text-5xl font-black tracking-tighter leading-none text-foreground">
              {active.length > 0
                ? <>{active.length}<span className="text-primary"> งาน</span></>
                : <span className="text-3xl">ว่างแล้ว</span>
              }
            </h1>
            <p className="text-[13px] text-muted-foreground mt-2 font-medium">
              {active.length > 0 ? 'รอน้องจัดการ' : 'ไม่มีงานเลยวันนี้'}
            </p>
          </div>
          <ProgressRing done={completed.length} total={nonArchived.length} />
        </div>

        {/* Search bar (collapse) */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-3"
            >
              <div className="relative">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  autoFocus
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ค้นหางาน..."
                  className="w-full h-10 pl-10 pr-8 rounded-2xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                    <X size={13} className="text-muted-foreground" />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filter pills — layoutId sliding background */}
        <div className="flex gap-1.5 pb-3 overflow-x-auto no-scrollbar">
          {FILTERS.map((f) => {
            const isActive = filter === f
            return (
              <motion.button
                key={f}
                onClick={() => setFilter(f)}
                whileTap={{ scale: 0.93 }}
                className={cn(
                  'relative flex-shrink-0 px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-colors duration-150',
                  isActive ? 'text-white' : 'bg-muted text-muted-foreground'
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="active-filter-bg"
                    className={cn('absolute inset-0 rounded-full', PILL_BG[f])}
                    transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative z-10">{f}</span>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* ══ Task list ══ */}

      {/* Empty state: render OUTSIDE scroll container so it truly fills remaining height */}
      {!loading && groups.length === 0 && completed.length === 0 && (
        <div className="flex-1 flex items-center justify-center px-5 pb-20">
          <EmptyState />
        </div>
      )}

      {loading || groups.length > 0 || completed.length > 0 ? (
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pt-1 safe-bottom">
        {loading ? (
          <>{[0, 1, 2].map((i) => <TaskSkeleton key={i} />)}</>
        ) : (
          <>
            {groups.map((group) => (
              <div key={group.label} className="mb-5">
                {/* Section header: label — divider — count */}
                <div className="flex items-center gap-2.5 mb-2.5">
                  <span className={cn(
                    'text-[10px] font-black uppercase tracking-[0.1em] flex-shrink-0',
                    group.overdue ? 'text-destructive' : 'text-muted-foreground'
                  )}>
                    {group.label}
                  </span>
                  <div className={cn(
                    'h-px flex-1',
                    group.overdue ? 'bg-destructive/25' : 'bg-border'
                  )} />
                  <span className={cn(
                    'text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0',
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
                      transition={{ delay: i * 0.04, duration: 0.22 }}
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
              </div>
            ))}

            {/* Completed section (collapsible) */}
            {completed.length > 0 && (
              <div className="mb-6">
                <button
                  onClick={() => setShowCompleted((v) => !v)}
                  className="flex items-center gap-2.5 mb-2.5 w-full"
                >
                  <span className="text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground flex-shrink-0">
                    เสร็จแล้ว
                  </span>
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground flex-shrink-0">
                    {completed.length}
                  </span>
                  <motion.span
                    animate={{ rotate: showCompleted ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown size={13} className="text-muted-foreground" />
                  </motion.span>
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
      ) : null}

      <QuickAddFAB onSelect={(type) => { if (type === 'task') openNew() }} />

      <TaskForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditTask(null) }}
        task={editTask}
      />
    </div>
  )
}
