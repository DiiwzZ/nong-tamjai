import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowLeft, Search, X, ArchiveX, Check } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { cn, formatDate } from '@/lib/utils'

const PRIORITY_ACCENT = {
  high:   { color: '#ef4444' },
  medium: { color: '#f59e0b' },
  low:    { color: '#10b981' },
}

function ArchiveCard({ task, categories }) {
  const accent   = PRIORITY_ACCENT[task.priority] || PRIORITY_ACCENT.medium
  const category = categories?.find((c) => c.id === task.categoryId)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl mb-2.5 border-l-[3px] border-t border-r border-b border-border bg-card opacity-60"
      style={{ borderLeftColor: accent.color }}
    >
      <div className="px-4 py-3.5 flex items-center gap-3">
        {/* Check icon */}
        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <Check size={12} strokeWidth={3} className="text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-semibold line-through text-muted-foreground truncate">
            {task.title}
          </p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {category && (
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                style={{ backgroundColor: category.color + '22', color: category.color }}
              >
                {category.label}
              </span>
            )}
            {task.completedAt && (
              <span className="text-[10px] text-muted-foreground">
                เสร็จ {formatDate(task.completedAt)}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function Archive({ onBack }) {
  const { tasks, categories } = useStore()
  const [search, setSearch] = useState('')

  const archived = useMemo(() => {
    const list = tasks.filter((t) => t.status === 'archived' || t.status === 'completed')
    if (!search) return list
    return list.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))
  }, [tasks, search])

  return (
    <div className="flex flex-col h-full">

      {/* Header */}
      <div className="px-5 pb-4 bg-background sticky top-0 z-20 header-safe-top">
        <div className="flex items-center gap-3 mb-4">
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={onBack}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-muted text-foreground"
          >
            <ArrowLeft size={18} />
          </motion.button>
          <h1 className="text-2xl font-black tracking-tighter text-foreground">Archive</h1>
          <span className="ml-auto text-[11px] font-bold text-muted-foreground bg-muted px-2 py-1 rounded-full">
            {archived.length}
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาใน archive..."
            className="w-full h-10 pl-10 pr-9 rounded-2xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X size={13} className="text-muted-foreground" />
            </button>
          )}
        </div>
        <div className="h-px bg-border mt-4" />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pt-3 safe-bottom">
        {archived.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center gap-5 py-24 text-center"
          >
            <div className="w-24 h-24 rounded-3xl bg-muted border border-border flex items-center justify-center">
              <ArchiveX size={38} className="text-muted-foreground" />
            </div>
            <div>
              <p className="text-xl font-black text-foreground tracking-tight">น้องหาไม่เจอ</p>
              <p className="text-sm text-muted-foreground mt-1.5 font-medium">
                งานที่เสร็จแล้วจะมาอยู่ที่นี่
              </p>
            </div>
          </motion.div>
        ) : (
          <AnimatePresence>
            {archived.map((task) => (
              <ArchiveCard key={task.id} task={task} categories={categories} />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
