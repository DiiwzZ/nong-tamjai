import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'motion/react'
import { X } from 'lucide-react'
import { useStore } from '@/store/useStore'

const PRIORITIES = [
  { id: 'high',   label: 'สูง',   color: '#ef4444' },
  { id: 'medium', label: 'กลาง',  color: '#f59e0b' },
  { id: 'low',    label: 'ต่ำ',   color: '#22c55e' },
]

const inputStyle = {
  width: '100%',
  height: 52,
  background: '#0f0f14',
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

const labelStyle = {
  display: 'block',
  fontSize: 12,
  fontWeight: 700,
  color: '#6b6b88',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  marginBottom: 8,
}

export function TaskForm({ open, onClose, task }) {
  const { addTask, updateTask, deleteTask, archiveTask, categories } = useStore()
  const isEdit = !!task

  const [form, setForm] = useState({
    title: '',
    priority: 'medium',
    categoryId: '',
    dueDate: '',
    note: '',
  })

  useEffect(() => {
    if (open) {
      if (task) {
        setForm({
          title: task.title || '',
          priority: task.priority || 'medium',
          categoryId: task.categoryId || '',
          dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : '',
          note: task.note || '',
        })
      } else {
        setForm({ title: '', priority: 'medium', categoryId: '', dueDate: '', note: '' })
      }
    }
  }, [task, open])

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const handleSubmit = () => {
    if (!form.title.trim()) return
    const data = {
      ...form,
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
    }
    if (isEdit) updateTask(task.id, data)
    else addTask(data)
    onClose()
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, zIndex: 40,
              background: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(6px)',
            }}
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0, bottom: 0.25 }}
            onDragEnd={(_, info) => { if (info.offset.y > 80) onClose() }}
            style={{
              position: 'fixed',
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100%',
              maxWidth: 430,
              zIndex: 50,
              maxHeight: '92dvh',
              display: 'flex',
              flexDirection: 'column',
              background: '#1a1a22',
              borderTop: '1px solid #252530',
              borderRadius: '24px 24px 0 0',
            }}
          >
            {/* Drag handle */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
              <div style={{ width: 36, height: 4, borderRadius: 99, background: '#3b3b50' }} />
            </div>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 12px' }}>
              <h2 style={{ fontSize: 19, fontWeight: 700, color: '#f0f0f8', margin: 0 }}>
                {isEdit ? 'แก้ไข Task' : 'Task ใหม่'}
              </h2>
              <button
                onClick={onClose}
                style={{
                  width: 36, height: 36, borderRadius: 12,
                  background: '#252530', border: 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={16} color="#6b6b88" />
              </button>
            </div>

            {/* Scrollable fields */}
            <div
              className="no-scrollbar"
              style={{ overflowY: 'auto', flex: 1, padding: '4px 20px 32px', display: 'flex', flexDirection: 'column', gap: 20 }}
            >
              {/* Title */}
              <div>
                <label style={labelStyle}>ชื่อ Task</label>
                <input
                  autoFocus
                  value={form.title}
                  onChange={(e) => set('title', e.target.value)}
                  placeholder="ต้องทำอะไร..."
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
                  onBlur={(e) => (e.target.style.borderColor = '#252530')}
                />
              </div>

              {/* Priority */}
              <div>
                <label style={labelStyle}>Priority</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {PRIORITIES.map((p) => {
                    const active = form.priority === p.id
                    return (
                      <button
                        key={p.id}
                        onClick={() => set('priority', p.id)}
                        style={{
                          flex: 1, height: 48,
                          borderRadius: 13,
                          border: `1.5px solid ${active ? p.color : '#252530'}`,
                          background: active ? `${p.color}1a` : '#0f0f14',
                          color: active ? p.color : '#6b6b88',
                          fontSize: 15, fontWeight: 700,
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          transition: 'all 0.15s',
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
                  <label style={labelStyle}>หมวดหมู่</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button
                      onClick={() => set('categoryId', '')}
                      style={{
                        height: 44, padding: '0 16px', borderRadius: 12,
                        border: `1.5px solid ${!form.categoryId ? '#3b82f6' : '#252530'}`,
                        background: !form.categoryId ? '#3b82f61a' : '#0f0f14',
                        color: !form.categoryId ? '#3b82f6' : '#6b6b88',
                        fontSize: 14, fontWeight: 600,
                        cursor: 'pointer', fontFamily: 'inherit',
                      }}
                    >
                      ไม่ระบุ
                    </button>
                    {categories.map((cat) => {
                      const active = form.categoryId === cat.id
                      return (
                        <button
                          key={cat.id}
                          onClick={() => set('categoryId', cat.id)}
                          style={{
                            height: 44, padding: '0 16px', borderRadius: 12,
                            border: `1.5px solid ${active ? cat.color : '#252530'}`,
                            background: active ? `${cat.color}1a` : '#0f0f14',
                            color: active ? cat.color : '#6b6b88',
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

              {/* Due Date */}
              <div>
                <label style={labelStyle}>กำหนดส่ง</label>
                <input
                  type="datetime-local"
                  value={form.dueDate}
                  onChange={(e) => set('dueDate', e.target.value)}
                  style={{ ...inputStyle }}
                  onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
                  onBlur={(e) => (e.target.style.borderColor = '#252530')}
                />
              </div>

              {/* Note */}
              <div>
                <label style={labelStyle}>โน้ต</label>
                <textarea
                  value={form.note}
                  onChange={(e) => set('note', e.target.value)}
                  placeholder="รายละเอียดเพิ่มเติม..."
                  rows={3}
                  className="no-scrollbar"
                  style={{
                    width: '100%', resize: 'none',
                    background: '#0f0f14',
                    border: '1px solid #252530',
                    borderRadius: 14,
                    padding: '14px 16px',
                    fontSize: 15, fontWeight: 400,
                    color: '#f0f0f8',
                    outline: 'none',
                    fontFamily: 'inherit',
                    lineHeight: 1.6,
                    colorScheme: 'dark',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
                  onBlur={(e) => (e.target.style.borderColor = '#252530')}
                />
              </div>

              {/* Archive / Delete actions for edit */}
              {isEdit && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => { archiveTask(task.id); onClose() }}
                    style={{
                      flex: 1, height: 44, borderRadius: 13,
                      border: '1px solid #252530', background: '#0f0f14',
                      color: '#6b6b88', fontSize: 14, fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    เก็บถาวร
                  </button>
                  <button
                    onClick={() => { deleteTask(task.id); onClose() }}
                    style={{
                      flex: 1, height: 44, borderRadius: 13,
                      border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)',
                      color: '#f87171', fontSize: 14, fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    ลบ Task
                  </button>
                </div>
              )}

              {/* Submit */}
              <button
                onClick={handleSubmit}
                className="active:scale-[0.98] transition-transform"
                style={{
                  width: '100%', height: 54,
                  borderRadius: 15,
                  background: '#3b82f6',
                  border: 'none',
                  color: '#fff',
                  fontSize: 17, fontWeight: 700,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  boxShadow: '0 4px 20px rgba(59,130,246,0.35)',
                }}
              >
                {isEdit ? 'บันทึก' : 'เพิ่ม Task'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
