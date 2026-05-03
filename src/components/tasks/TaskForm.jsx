import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { ArrowLeft, Calendar } from 'lucide-react'
import { useStore } from '@/store/useStore'

const PRIORITIES = [
  { id: 'high',   label: 'สูง',   color: '#ef4444' },
  { id: 'medium', label: 'กลาง',  color: '#f59e0b' },
  { id: 'low',    label: 'ต่ำ',   color: '#22c55e' },
]

const lbl = {
  display: 'block', fontSize: 11, fontWeight: 700, color: '#6b6b88',
  textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 8,
}

/* 16px min → prevents iOS auto-zoom on focus */
const inp = {
  width: '100%',
  background: '#1a1a22',
  border: '1px solid #252530',
  borderRadius: 14,
  padding: '0 16px',
  fontSize: 16,
  fontWeight: 500,
  color: '#f0f0f8',
  outline: 'none',
  fontFamily: 'inherit',
  colorScheme: 'dark',
}

export function TaskForm({ onClose, task }) {
  const { addTask, updateTask, deleteTask, archiveTask, categories } = useStore()
  const isEdit = !!task

  const [form, setForm] = useState({
    title: '', priority: 'medium', categoryId: '', dueDate: '', note: '',
  })

  useEffect(() => {
    setForm(task ? {
      title:      task.title      || '',
      priority:   task.priority   || 'medium',
      categoryId: task.categoryId || '',
      dueDate:    task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : '',
      note:       task.note       || '',
    } : { title: '', priority: 'medium', categoryId: '', dueDate: '', note: '' })
  }, [task])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = () => {
    if (!form.title.trim()) return
    const data = { ...form, dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null }
    if (isEdit) updateTask(task.id, data)
    else addTask(data)
    onClose()
  }

  const canSubmit = form.title.trim().length > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0f0f14' }}>

      {/* ── Header ── */}
      <div style={{
        flexShrink: 0,
        background: 'rgba(15,15,20,0.97)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid #252530',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        zIndex: 10,
      }}>
        <div style={{
          height: 56, paddingLeft: 16, paddingRight: 20,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <button
            type="button"
            aria-label="กลับ"
            onClick={onClose}
            style={{
              width: 36, height: 36, borderRadius: 11,
              background: '#1a1a22', border: '1px solid #252530',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0,
            }}
          >
            <ArrowLeft size={16} color="#f0f0f8" />
          </button>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#f0f0f8', letterSpacing: '-0.3px', margin: 0 }}>
            {isEdit ? 'แก้ไข Task' : 'Task ใหม่'}
          </h1>
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div
        className="no-scrollbar"
        style={{ flex: 1, overflowY: 'auto', padding: '28px 20px 32px', display: 'flex', flexDirection: 'column', gap: 22 }}
      >

        {/* Title */}
        <div>
          <label style={lbl}>ชื่อ Task</label>
          <input
            value={form.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="ต้องทำอะไร..."
            style={{ ...inp, height: 56 }}
            onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
            onBlur={(e)  => (e.target.style.borderColor = '#252530')}
          />
        </div>

        {/* Note */}
        <div>
          <label style={lbl}>โน้ต</label>
          <textarea
            value={form.note}
            onChange={(e) => set('note', e.target.value)}
            placeholder="รายละเอียดเพิ่มเติม..."
            rows={3}
            className="no-scrollbar"
            style={{
              ...inp, height: 'auto', padding: '14px 16px',
              resize: 'none', lineHeight: 1.6, fontWeight: 400,
            }}
            onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
            onBlur={(e)  => (e.target.style.borderColor = '#252530')}
          />
        </div>

        {/* Due date */}
        <div>
          <label style={lbl}>กำหนดส่ง</label>
          <div style={{ position: 'relative' }}>
            <Calendar
              size={15} color="#6b6b88"
              style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 1 }}
            />
            <input
              type="datetime-local"
              value={form.dueDate}
              onChange={(e) => set('dueDate', e.target.value)}
              style={{ ...inp, height: 52, paddingLeft: 42 }}
              onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
              onBlur={(e)  => (e.target.style.borderColor = '#252530')}
            />
          </div>
        </div>

        {/* Priority */}
        <div>
          <label style={lbl}>Priority</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {PRIORITIES.map((p) => {
              const on = form.priority === p.id
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => set('priority', p.id)}
                  style={{
                    flex: 1, height: 48, borderRadius: 13,
                    border: `1.5px solid ${on ? p.color : '#252530'}`,
                    background: on ? `${p.color}18` : '#1a1a22',
                    color: on ? p.color : '#6b6b88',
                    fontSize: 15, fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'border-color 0.14s, background 0.14s, color 0.14s',
                  }}
                >
                  {p.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Category */}
        {categories.length > 0 && (
          <div>
            <label style={lbl}>หมวดหมู่</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => set('categoryId', '')}
                style={{
                  height: 40, padding: '0 16px', borderRadius: 11,
                  border: `1.5px solid ${!form.categoryId ? '#3b82f6' : '#252530'}`,
                  background: !form.categoryId ? 'rgba(59,130,246,0.12)' : '#1a1a22',
                  color: !form.categoryId ? '#3b82f6' : '#6b6b88',
                  fontSize: 14, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                ไม่ระบุ
              </button>
              {categories.map((cat) => {
                const on = form.categoryId === cat.id
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => set('categoryId', cat.id)}
                    style={{
                      height: 40, padding: '0 16px', borderRadius: 11,
                      border: `1.5px solid ${on ? cat.color : '#252530'}`,
                      background: on ? `${cat.color}18` : '#1a1a22',
                      color: on ? cat.color : '#6b6b88',
                      fontSize: 14, fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    {cat.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Archive / Delete — edit mode only */}
        {isEdit && (
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button
              type="button"
              onClick={() => { archiveTask(task.id); onClose() }}
              style={{
                flex: 1, height: 44, borderRadius: 13,
                border: '1px solid #252530', background: '#1a1a22',
                color: '#6b6b88', fontSize: 14, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              เก็บถาวร
            </button>
            <button
              type="button"
              onClick={() => { deleteTask(task.id); onClose() }}
              style={{
                flex: 1, height: 44, borderRadius: 13,
                border: '1px solid rgba(239,68,68,0.30)',
                background: 'rgba(239,68,68,0.08)',
                color: '#f87171', fontSize: 14, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              ลบ Task
            </button>
          </div>
        )}
      </div>

      {/* ── Sticky submit ── */}
      <div style={{
        flexShrink: 0,
        padding: '12px 20px',
        paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 16px))',
        background: 'rgba(15,15,20,0.97)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid #252530',
      }}>
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          style={{
            width: '100%', height: 54,
            borderRadius: 16, border: 'none',
            background: canSubmit ? '#3b82f6' : '#1e1e28',
            color: canSubmit ? '#fff' : '#3b3b50',
            fontSize: 17, fontWeight: 700,
            cursor: canSubmit ? 'pointer' : 'default',
            fontFamily: 'inherit',
            boxShadow: canSubmit ? '0 4px 22px rgba(59,130,246,0.30)' : 'none',
            transition: 'background 0.18s, color 0.18s, box-shadow 0.18s',
          }}
        >
          {isEdit ? 'บันทึก' : 'เพิ่ม Task'}
        </motion.button>
      </div>
    </div>
  )
}
