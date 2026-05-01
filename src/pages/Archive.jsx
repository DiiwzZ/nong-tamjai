import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowLeft, Search, X, ArchiveX } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { cn, PRIORITY, formatDate } from '@/lib/utils'

function ArchiveCard({ task, categories }) {
  const priority = PRIORITY[task.priority] || PRIORITY.medium
  const category = categories?.find((c) => c.id === task.categoryId)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-xl p-4 mb-2 border opacity-70',
        priority.bg, priority.border
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 w-5 h-5 rounded-full bg-green-500 flex-shrink-0 flex items-center justify-center">
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn('text-sm font-medium line-through', priority.text)}>{task.title}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {category && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md text-white" style={{ backgroundColor: category.color }}>
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
      <div className="px-5 pt-14 pb-4 bg-background sticky top-0 z-20">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={onBack} className="p-2 -ml-2 rounded-xl hover:bg-muted transition-colors">
            <ArrowLeft size={20} className="text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Archive</h1>
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาใน archive..."
            className="w-full h-10 pl-9 pr-9 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X size={14} className="text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-4">
        {archived.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center gap-4 py-20 text-center"
          >
            <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center">
              <ArchiveX size={36} className="text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-foreground">น้องหาไม่เจออ่ะ 🥺</p>
              <p className="text-sm text-muted-foreground mt-1">งานที่เสร็จแล้วจะมาอยู่ที่นี่</p>
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
