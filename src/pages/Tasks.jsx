import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import {
  Archive as ArchiveIcon,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Moon,
  Search,
  Sparkles,
  Sun,
  X,
} from 'lucide-react'
import { Archive } from '@/pages/Archive'
import { TaskCard } from '@/components/tasks/TaskCard'
import { TaskForm } from '@/components/tasks/TaskForm'
import { Confetti } from '@/components/ui/Confetti'
import { QuickAddFAB } from '@/components/ui/QuickAdd'
import { TaskSkeleton } from '@/components/ui/Skeleton'
import { cn } from '@/lib/utils'
import { useStore } from '@/store/useStore'

const FILTERS = [
  { id: 'all', label: 'ทั้งหมด', activeClass: 'bg-primary text-white shadow-[0_18px_28px_-18px_rgba(59,130,246,0.9)]' },
  { id: 'high', label: 'สูง', activeClass: 'bg-red-500 text-white shadow-[0_18px_28px_-18px_rgba(239,68,68,0.9)]' },
  { id: 'medium', label: 'กลาง', activeClass: 'bg-amber-500 text-white shadow-[0_18px_28px_-18px_rgba(245,158,11,0.9)]' },
  { id: 'low', label: 'ต่ำ', activeClass: 'bg-emerald-500 text-white shadow-[0_18px_28px_-18px_rgba(16,185,129,0.9)]' },
]

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center gap-4 py-20 text-center"
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-[1.8rem] border border-white/8 bg-white/[0.04] shadow-[0_22px_40px_-28px_rgba(0,0,0,1)]">
        <ClipboardList size={34} className="text-primary" />
      </div>
      <div className="space-y-2">
        <p className="text-lg font-semibold tracking-[-0.03em] text-foreground">ตอนนี้คิวโล่งแล้ว</p>
        <p className="max-w-[18rem] text-sm leading-6 text-muted-foreground">
          เพิ่มงานใหม่ได้เลย เดี๋ยวน้องจะช่วยจัดจังหวะให้ดูเรียบร้อยขึ้น
        </p>
      </div>
    </motion.div>
  )
}

function SummaryChip({ label, value, tone = 'default' }) {
  const toneClass = {
    default: 'border-white/8 bg-white/[0.04] text-foreground',
    primary: 'border-primary/20 bg-primary/10 text-primary',
  }

  return (
    <div className={cn('rounded-[1.3rem] border p-4 shadow-[0_22px_40px_-28px_rgba(0,0,0,1)]', toneClass[tone])}>
      <p className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">{label}</p>
      <p className={cn('mt-2 numeric-tabular text-[1.45rem] font-black leading-none tracking-[-0.045em]', tone === 'primary' ? 'text-primary' : 'text-foreground')}>
        {value}
      </p>
    </div>
  )
}

export function Tasks() {
  const { tasks, categories, darkMode, update } = useStore()
  const [formOpen, setFormOpen] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [filter, setFilter] = useState('all')
  const [showCompleted, setShowCompleted] = useState(false)
  const [showArchivePage, setShowArchivePage] = useState(false)
  const [confetti, setConfetti] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400)
    return () => clearTimeout(timer)
  }, [])

  const active = useMemo(() => {
    let list = tasks.filter((task) => task.status === 'active')

    if (filter !== 'all') {
      list = list.filter((task) => task.priority === filter)
    }

    if (search.trim()) {
      const keyword = search.trim().toLowerCase()
      list = list.filter((task) => task.title.toLowerCase().includes(keyword))
    }

    return list.sort((a, b) => {
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return new Date(a.dueDate) - new Date(b.dueDate)
    })
  }, [tasks, filter, search])

  const completed = useMemo(() => tasks.filter((task) => task.status === 'completed'), [tasks])

  const latestCompleted = useMemo(
    () =>
      [...completed]
        .sort((a, b) => new Date(b.completedAt || 0) - new Date(a.completedAt || 0))
        .slice(0, 1),
    [completed]
  )

  const remainingCompleted = useMemo(
    () => completed.filter((task) => task.id !== latestCompleted[0]?.id),
    [completed, latestCompleted]
  )

  const dateLabel = useMemo(
    () =>
      new Date().toLocaleDateString('th-TH', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }),
    []
  )

  const heroTitle = active.length > 0
    ? (
        <>
          มี <span className="text-primary">{active.length} งาน</span>
          <br />
          รอน้องจัดการ
        </>
      )
    : (
        <>
          น้องว่าง
          <br />
          ไม่มีงานเลย
        </>
      )

  const heroBody = active.length > 0
    ? 'แยกคิววันนี้ให้แล้ว งานเร่งอยู่บนสุด ที่เหลือเลื่อนดูต่อได้เลย'
    : 'คิววันนี้เคลียร์หมดแล้ว ถ้ามีอะไรเพิ่มเข้ามา เดี๋ยวน้องช่วยจัดให้ใหม่ทันที'

  const triggerConfetti = (event) => {
    const rect = event.currentTarget?.getBoundingClientRect?.()
    setConfetti({
      x: rect?.left ?? window.innerWidth / 2,
      y: rect?.top ?? window.innerHeight / 2,
    })
    setTimeout(() => setConfetti(null), 800)
  }

  const handleTap = (task) => {
    setEditTask(task)
    setFormOpen(true)
  }

  const openNew = () => {
    setEditTask(null)
    setFormOpen(true)
  }

  if (showArchivePage) {
    return <Archive onBack={() => setShowArchivePage(false)} />
  }

  return (
    <div className="flex h-full flex-col">
      {confetti && <Confetti trigger={true} x={confetti.x} y={confetti.y} />}

      <div className="sticky top-0 z-20 bg-background/92 px-6 pb-6 backdrop-blur-xl header-safe-top">
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-[11px] font-medium tracking-[0.08em] text-muted-foreground">{dateLabel}</p>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/14 bg-primary/8 px-3 py-1 text-[11px] font-semibold tracking-[0.14em] text-primary uppercase">
                <Sparkles size={12} />
                Focus board
              </div>
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowArchivePage(true)}
                aria-label="เปิดคลังงาน"
                className="flex h-11 w-11 items-center justify-center rounded-[1.05rem] border border-white/7 bg-white/[0.04] text-muted-foreground shadow-[0_18px_34px_-26px_rgba(0,0,0,1)]"
              >
                <ArchiveIcon size={17} />
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setSearchOpen((value) => !value)}
                aria-label={searchOpen ? 'ปิดการค้นหา' : 'เปิดการค้นหา'}
                className={cn(
                  'flex h-11 w-11 items-center justify-center rounded-[1.05rem] border shadow-[0_18px_34px_-26px_rgba(0,0,0,1)] transition-colors',
                  searchOpen
                    ? 'border-primary/30 bg-primary text-white'
                    : 'border-white/7 bg-white/[0.04] text-muted-foreground'
                )}
              >
                <Search size={17} />
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => update({ darkMode: !darkMode })}
                aria-label={darkMode ? 'สลับเป็นโหมดสว่าง' : 'สลับเป็นโหมดมืด'}
                className="flex h-11 w-11 items-center justify-center rounded-[1.05rem] border border-white/7 bg-white/[0.04] text-amber-300 shadow-[0_18px_34px_-26px_rgba(0,0,0,1)]"
              >
                <motion.div
                  key={darkMode ? 'sun' : 'moon'}
                  initial={{ rotate: -30, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {darkMode ? <Sun size={17} /> : <Moon size={17} />}
                </motion.div>
              </motion.button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-3">
              <h1 className="max-w-[16rem] text-pretty text-[2.9rem] font-black leading-[0.88] tracking-[-0.065em] text-foreground">
                {heroTitle}
              </h1>
              <p className="max-w-[19rem] text-sm leading-6 text-muted-foreground">
                {heroBody}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <SummaryChip label="คิวค้างอยู่" value={`${active.length} งาน`} tone="primary" />
              <SummaryChip label="งานที่เคลียร์แล้ว" value={`${completed.length} งาน`} />
            </div>
          </div>

          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="relative rounded-[1.35rem] border border-white/8 bg-white/[0.04] p-1.5">
                  <Search size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    autoFocus
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="ค้นหางาน..."
                    className="h-12 w-full rounded-[1rem] bg-transparent pl-12 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      aria-label="ล้างคำค้นหา"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="rounded-[1.45rem] border border-white/8 bg-white/[0.03] p-1.5 shadow-[0_22px_42px_-30px_rgba(0,0,0,1)]">
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {FILTERS.map((item) => {
                const isActive = filter === item.id

                return (
                  <motion.button
                    key={item.id}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFilter(item.id)}
                    className={cn(
                      'min-w-[72px] rounded-[1rem] px-4 py-2.5 text-[13px] font-semibold tracking-[-0.01em] transition-all',
                      isActive
                        ? item.activeClass
                        : 'bg-transparent text-muted-foreground'
                    )}
                  >
                    {item.label}
                  </motion.button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {!loading && active.length === 0 && latestCompleted.length === 0 && remainingCompleted.length === 0 && (
        <div className="flex flex-1 items-center justify-center px-6 pb-20">
          <EmptyState />
        </div>
      )}

      {(loading || active.length > 0 || latestCompleted.length > 0 || remainingCompleted.length > 0) && (
        <div className="flex-1 overflow-y-auto px-6 pt-2 no-scrollbar safe-bottom">
          {loading ? (
            <>
              {[0, 1, 2].map((item) => (
                <TaskSkeleton key={item} />
              ))}
            </>
          ) : (
            <div className="space-y-8 pb-4">
              {latestCompleted.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
                        Latest clear
                      </p>
                      <h2 className="mt-1 text-[1.05rem] font-semibold tracking-[-0.03em] text-foreground">
                        เพิ่งเคลียร์ไป
                      </h2>
                    </div>
                    <span className="rounded-full border border-emerald-400/16 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold text-emerald-300">
                      เสร็จล่าสุด
                    </span>
                  </div>

                  <div className="space-y-4">
                    {latestCompleted.map((task) => (
                      <TaskCard key={task.id} task={task} onTap={handleTap} categories={categories} />
                    ))}
                  </div>
                </section>
              )}

              <section className="space-y-4">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
                      Today queue
                    </p>
                    <h2 className="mt-1 text-[1.05rem] font-semibold tracking-[-0.03em] text-foreground">
                      งานที่ต้องทำ
                    </h2>
                  </div>
                  <span className="text-[12px] font-semibold text-primary numeric-tabular">
                    {active.length} รายการ
                  </span>
                </div>

                {active.length === 0 ? (
                  <div className="rounded-[1.55rem] border border-dashed border-white/10 px-5 py-6 text-sm leading-6 text-muted-foreground">
                    ไม่มีงานค้างตาม filter นี้แล้ว ลองสลับหมวดหรือเพิ่มงานใหม่ได้เลย
                  </div>
                ) : (
                  <AnimatePresence>
                    {active.map((task, index) => (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ delay: index * 0.04, duration: 0.25 }}
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
              </section>

              {remainingCompleted.length > 0 && (
                <section className="space-y-4">
                  <button
                    onClick={() => setShowCompleted((value) => !value)}
                    className="flex w-full items-center gap-2.5 text-left text-muted-foreground"
                  >
                    <CheckCircle2 size={14} />
                    <span className="text-[11px] font-medium tracking-[0.16em] uppercase">
                      Completed archive
                    </span>
                    <span className="text-sm font-semibold text-foreground numeric-tabular">
                      {remainingCompleted.length}
                    </span>
                    <motion.span
                      animate={{ rotate: showCompleted ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="ml-auto"
                    >
                      <ChevronDown size={14} />
                    </motion.span>
                  </button>

                  <AnimatePresence>
                    {showCompleted && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4 overflow-hidden"
                      >
                        {remainingCompleted.map((task) => (
                          <TaskCard key={task.id} task={task} onTap={handleTap} categories={categories} />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </section>
              )}
            </div>
          )}
        </div>
      )}

      <QuickAddFAB
        onSelect={(type) => {
          if (type === 'task') {
            openNew()
          }
        }}
      />

      <TaskForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditTask(null)
        }}
        task={editTask}
      />
    </div>
  )
}
