import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Search, CheckCircle2, Archive as ArchiveIcon, X, ClipboardList, Moon, Sun, ChevronDown } from 'lucide-react'
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
      <div className="flex h-20 w-20 items-center justify-center rounded-[1.7rem] bg-primary/10">
        <ClipboardList size={36} className="text-primary" />
      </div>
      <div className="space-y-1.5">
        <p className="font-semibold text-foreground">ยังไม่มีงานเลย น้องว่างอยู่ตอนนี้</p>
        <p className="text-sm text-muted-foreground">กด + เพื่อเพิ่มงานแรกได้เลย</p>
      </div>
    </motion.div>
  )
}

export function Tasks() {
  const { tasks, categories, darkMode, update } = useStore()
  const [formOpen, setFormOpen] = useState(false)
  const [editTask, setEditTask] = useState(null)
  const [search, setSearch] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [filter, setFilter] = useState('ทั้งหมด')
  const [showCompleted, setShowCompleted] = useState(false)
  const [showArchivePage, setShowArchivePage] = useState(false)
  const [confetti, setConfetti] = useState(null)
  const [loading, setLoading] = useState(true)

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

  const highlightedCompleted = useMemo(
    () =>
      tasks
        .filter((t) => t.status === 'completed')
        .sort((a, b) => new Date(b.completedAt || 0) - new Date(a.completedAt || 0))
        .slice(0, 1),
    [tasks]
  )

  const remainingCompleted = useMemo(
    () => completed.filter((t) => t.id !== highlightedCompleted[0]?.id),
    [completed, highlightedCompleted]
  )

  const visibleTasks = useMemo(() => [...highlightedCompleted, ...active], [highlightedCompleted, active])

  const handleTap = (task) => {
    setEditTask(task)
    setFormOpen(true)
  }

  const openNew = () => {
    setEditTask(null)
    setFormOpen(true)
  }

  if (showArchivePage) return <Archive onBack={() => setShowArchivePage(false)} />

  return (
    <div className="flex h-full flex-col">
      {confetti && <Confetti trigger={true} x={confetti.x} y={confetti.y} />}

      <div className="sticky top-0 z-20 bg-background/92 px-6 pb-5 backdrop-blur-xl header-safe-top">
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-medium text-muted-foreground">
              {new Date().toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>

            <div className="flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => setShowArchivePage(true)}
                aria-label="เปิดคลังงาน"
                className="flex h-10 w-10 items-center justify-center rounded-[1rem] border border-white/6 bg-muted/68 text-muted-foreground"
              >
                <ArchiveIcon size={17} />
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => setSearchOpen((v) => !v)}
                aria-label={searchOpen ? 'ปิดการค้นหา' : 'เปิดการค้นหา'}
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-[1rem] border border-white/6 transition-colors',
                  searchOpen ? 'bg-primary text-white border-primary' : 'bg-muted/68 text-muted-foreground'
                )}
              >
                <Search size={17} />
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => update({ darkMode: !darkMode })}
                aria-label={darkMode ? 'สลับเป็นโหมดสว่าง' : 'สลับเป็นโหมดมืด'}
                className="flex h-10 w-10 items-center justify-center rounded-[1rem] border border-white/6 bg-muted/68 text-amber-300"
              >
                <motion.div
                  key={darkMode ? 'moon' : 'sun'}
                  initial={{ rotate: -30, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {darkMode ? <Sun size={17} /> : <Moon size={17} />}
                </motion.div>
              </motion.button>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/78">
              focus today
            </p>
            <h1 className="max-w-[16rem] text-balance text-[2.55rem] font-black leading-[0.9] tracking-[-0.055em] text-foreground">
              {active.length > 0 ? (
                <>
                  มี <span className="text-primary">{active.length} งาน</span>
                  <br />
                  รอน้องจัดการ
                </>
              ) : (
                <>
                  น้องว่าง
                  <br />
                  ไม่มีงานเลย
                </>
              )}
            </h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="numeric-tabular rounded-full border border-white/6 bg-muted/52 px-3 py-1.5 font-medium">
                ค้างอยู่ {active.length} งาน
              </span>
              <span className="numeric-tabular">{completed.length} งานเสร็จแล้ว</span>
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
                <div className="relative">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    autoFocus
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="ค้นหางาน..."
                    className="h-11 w-full rounded-[1.1rem] border border-white/6 bg-background/82 pl-10 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
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

          <div className="flex gap-2.5 overflow-x-auto no-scrollbar">
            {FILTERS.map((f) => {
              const isActive = filter === f
              const colors = {
                ทั้งหมด: 'bg-primary shadow-primary/30',
                สูง: 'bg-red-500 shadow-red-500/30',
                กลาง: 'bg-amber-500 shadow-amber-500/30',
                ต่ำ: 'bg-emerald-500 shadow-emerald-500/30',
              }

              return (
                <motion.button
                  key={f}
                  onClick={() => setFilter(f)}
                  whileTap={{ scale: 0.93 }}
                  className={cn(
                    'min-w-[68px] flex-shrink-0 rounded-full px-4 py-2 text-[13px] font-bold transition-all duration-200',
                    isActive ? `${colors[f]} text-white shadow-lg` : 'border border-white/6 bg-muted/52 text-muted-foreground'
                  )}
                >
                  {f}
                </motion.button>
              )
            })}
          </div>
        </div>
      </div>

      {!loading && visibleTasks.length === 0 && remainingCompleted.length === 0 && (
        <div className="flex flex-1 items-center justify-center px-6 pb-20">
          <EmptyState />
        </div>
      )}

      {(loading || visibleTasks.length > 0 || remainingCompleted.length > 0) && (
        <div className="flex-1 overflow-y-auto px-6 pt-3 no-scrollbar safe-bottom">
          {loading ? (
            <>
              {[0, 1, 2].map((i) => (
                <TaskSkeleton key={i} />
              ))}
            </>
          ) : (
            <div className="space-y-8 pb-3">
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-[14px] font-black tracking-[-0.02em] text-foreground">งานที่ต้องทำ</h2>
                  <span className="text-[12px] font-bold text-primary">ดูทั้งหมด</span>
                </div>

                <AnimatePresence>
                  {visibleTasks.map((task, i) => (
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
              </section>

              {remainingCompleted.length > 0 && (
                <section className="space-y-4">
                  <button onClick={() => setShowCompleted((v) => !v)} className="flex w-full items-center gap-2.5 text-muted-foreground">
                    <CheckCircle2 size={14} />
                    <span className="text-xs font-semibold uppercase tracking-wider">เสร็จแล้ว ({remainingCompleted.length})</span>
                    <motion.span
                      animate={{ rotate: showCompleted ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="ml-auto"
                    >
                      <ChevronDown size={13} />
                    </motion.span>
                  </button>

                  <AnimatePresence>
                    {showCompleted &&
                      remainingCompleted.map((task) => (
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
                </section>
              )}
            </div>
          )}
        </div>
      )}

      <QuickAddFAB onSelect={(type) => { if (type === 'task') openNew() }} />

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
