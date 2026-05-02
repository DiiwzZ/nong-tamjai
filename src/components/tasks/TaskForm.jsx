import { useState } from 'react'
import { motion } from 'motion/react'
import { ArrowLeft, Calendar } from 'lucide-react'
import { cn, PRIORITY } from '@/lib/utils'
import { useStore } from '@/store/useStore'

const priorities = ['high', 'medium', 'low']

function createInitialForm(task) {
  return {
    title: task?.title || '',
    priority: task?.priority || 'medium',
    categoryId: task?.categoryId || '',
    dueDate: task?.dueDate ? task.dueDate.slice(0, 16) : '',
    note: task?.note || '',
  }
}

export function TaskForm({ task, onClose }) {
  const { addTask, updateTask, categories } = useStore()
  const isEdit = !!task

  const [form, setForm] = useState(() => createInitialForm(task))

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const handleSubmit = () => {
    if (!form.title.trim()) return
    const data = {
      ...form,
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
    }
    if (isEdit) {
      updateTask(task.id, data)
    } else {
      addTask(data)
    }
    onClose()
  }

  return (
    <div className="flex h-full flex-col bg-background">

      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-4 bg-background/92 px-5 pb-4 backdrop-blur-xl header-safe-top">
        <motion.button
          type="button"
          whileTap={{ scale: 0.88 }}
          onClick={onClose}
          aria-label="กลับ"
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[0.9rem] border border-white/[0.07] bg-white/[0.04] text-muted-foreground"
        >
          <ArrowLeft size={18} />
        </motion.button>
        <h1 className="flex-1 text-center text-[17px] font-bold tracking-[-0.025em] text-foreground">
          {isEdit ? 'แก้ไข Task' : 'New task'}
        </h1>
        {/* Spacer keeps title centered */}
        <div className="h-10 w-10 flex-shrink-0" />
      </div>

      {/* Scrollable fields */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pt-2">
        <div className="flex flex-col gap-5 pb-36">

          {/* Task name */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="task-title"
              className="text-[12px] font-semibold tracking-[0.07em] text-muted-foreground uppercase"
            >
              Task name
            </label>
            <input
              id="task-title"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="Write your task here..."
              className="w-full rounded-[1.2rem] border border-white/[0.07] bg-card px-4 py-3.5 text-[16px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary transition-[border-color,box-shadow] duration-150"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="task-desc"
              className="text-[12px] font-semibold tracking-[0.07em] text-muted-foreground uppercase"
            >
              Description
            </label>
            <textarea
              id="task-desc"
              value={form.note}
              onChange={(e) => set('note', e.target.value)}
              placeholder="Add more details or notes"
              rows={3}
              className="w-full resize-none rounded-[1.2rem] border border-white/[0.07] bg-card px-4 py-3.5 text-[16px] text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary transition-[border-color,box-shadow] duration-150"
            />
          </div>

          {/* Due date & time */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="task-due"
              className="text-[12px] font-semibold tracking-[0.07em] text-muted-foreground uppercase"
            >
              Due date &amp; time
            </label>
            <div className="relative">
              <input
                id="task-due"
                type="datetime-local"
                value={form.dueDate}
                onChange={(e) => set('dueDate', e.target.value)}
                className="w-full rounded-[1.2rem] border border-white/[0.07] bg-card px-4 py-3.5 pr-12 text-[16px] text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary transition-[border-color,box-shadow] duration-150"
              />
              <Calendar
                size={16}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
            </div>
          </div>

          {/* Priority + Category — 2-col */}
          <div className="grid grid-cols-2 gap-3">

            {/* Priority */}
            <div className="flex flex-col gap-2">
              <span className="text-[12px] font-semibold tracking-[0.07em] text-muted-foreground uppercase">
                Priority
              </span>
              <div className="flex flex-col gap-1.5">
                {priorities.map((p) => {
                  const pr = PRIORITY[p]
                  const isActive = form.priority === p
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => set('priority', p)}
                      className={cn(
                        'w-full rounded-[0.9rem] py-2.5 text-[13px] font-semibold border transition-[border-color,background-color,color]',
                        isActive
                          ? [pr.bg, pr.text, pr.border]
                          : 'border-white/[0.07] bg-card text-muted-foreground'
                      )}
                    >
                      {pr.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Category */}
            <div className="flex flex-col gap-2">
              <span className="text-[12px] font-semibold tracking-[0.07em] text-muted-foreground uppercase">
                Category
              </span>
              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => set('categoryId', '')}
                  className={cn(
                    'w-full rounded-[0.9rem] py-2.5 text-[13px] font-semibold border transition-[border-color,background-color,color]',
                    !form.categoryId
                      ? 'bg-primary text-white border-primary'
                      : 'border-white/[0.07] bg-card text-muted-foreground'
                  )}
                >
                  ไม่ระบุ
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => set('categoryId', cat.id)}
                    className={cn(
                      'w-full rounded-[0.9rem] py-2.5 text-[13px] font-semibold border text-white transition-[border-color,opacity]',
                      form.categoryId === cat.id
                        ? 'opacity-100 border-white/20'
                        : 'opacity-50 border-transparent'
                    )}
                    style={{ backgroundColor: cat.color }}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Sticky create/save button */}
      <div className="border-t border-white/[0.05] bg-background/92 px-5 pb-5 pt-3 backdrop-blur-xl nav-safe">
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full rounded-[1.3rem] py-4 text-[16px] font-bold text-white transition-transform active:scale-[0.98] bg-[linear-gradient(135deg,hsl(217_91%_60%),hsl(255_80%_60%))] shadow-[0_18px_34px_-16px_rgba(59,130,246,0.65)]"
        >
          {isEdit ? 'บันทึก' : 'Create task'}
        </button>
      </div>

    </div>
  )
}
