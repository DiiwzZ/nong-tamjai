import { useEffect, useState } from 'react'
import { Sheet } from '@/components/ui/Sheet'
import { Input, Textarea } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
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

export function TaskForm({ open, onClose, task }) {
  const { addTask, updateTask, categories } = useStore()
  const isEdit = !!task

  const [form, setForm] = useState(() => createInitialForm(task))

  useEffect(() => {
    if (open) setForm(createInitialForm(task))
  }, [open, task])

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
    <Sheet open={open} onClose={onClose} title={isEdit ? 'แก้ไข Task' : 'Task ใหม่'}>
      <div className="px-5 py-4 flex flex-col gap-4 pb-8">
        <Input
          label="ชื่อ Task"
          placeholder="ต้องทำอะไร..."
          value={form.title}
          onChange={(e) => set('title', e.target.value)}
          autoFocus
        />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-foreground">Priority</label>
          <div className="flex gap-2">
            {priorities.map((p) => {
              const pr = PRIORITY[p]
              const active = form.priority === p
              return (
                <button
                  key={p}
                  onClick={() => set('priority', p)}
                  className={cn(
                    'flex-1 py-2 rounded-xl text-sm font-medium border transition-all',
                    active ? [pr.bg, pr.text, pr.border] : 'bg-muted text-muted-foreground border-transparent'
                  )}
                >
                  {pr.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-foreground">หมวดหมู่</label>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => set('categoryId', '')}
              className={cn(
                'px-3 py-1.5 rounded-xl text-sm border transition-all',
                !form.categoryId
                  ? 'bg-primary text-white border-primary'
                  : 'bg-muted text-muted-foreground border-transparent'
              )}
            >
              ไม่ระบุ
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => set('categoryId', cat.id)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-sm border transition-all text-white',
                  form.categoryId === cat.id ? 'opacity-100 border-white/20' : 'opacity-50 border-transparent'
                )}
                style={{ backgroundColor: cat.color }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Due Date"
          type="datetime-local"
          value={form.dueDate}
          onChange={(e) => set('dueDate', e.target.value)}
        />

        <Textarea
          label="Note (ไม่บังคับ)"
          placeholder="รายละเอียดเพิ่มเติม..."
          value={form.note}
          onChange={(e) => set('note', e.target.value)}
          rows={3}
        />

        <Button onClick={handleSubmit} className="w-full mt-2">
          {isEdit ? 'บันทึก' : 'เพิ่ม Task'}
        </Button>
      </div>
    </Sheet>
  )
}
