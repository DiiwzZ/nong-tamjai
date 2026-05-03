import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowLeft, Search, X, Trash2 } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { formatDate } from '@/lib/utils'

function ArchiveCard({ task, categories }) {
  const category = categories?.find((c) => c.id === task.categoryId)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      style={{
        background: '#1a1a22',
        border: '1px solid #252530',
        borderRadius: 16,
        padding: '13px 16px',
        marginBottom: 10,
        opacity: 0.7,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        {/* Checkmark */}
        <div style={{
          width: 22, height: 22, borderRadius: 99, flexShrink: 0, marginTop: 1,
          background: '#3b82f6',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontSize: 15, fontWeight: 600,
            color: '#6b6b88',
            textDecoration: 'line-through',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            marginBottom: 4,
          }}>
            {task.title}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {category && (
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 8,
                background: `${category.color}22`, color: category.color,
              }}>
                {category.label}
              </span>
            )}
            {(task.completedAt || task.createdAt) && (
              <span style={{ fontSize: 12, color: '#4a4a60' }}>
                {formatDate(task.completedAt || task.createdAt)}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function Archive({ onTabChange }) {
  const { tasks, categories, clearArchive } = useStore()
  const [search, setSearch] = useState('')
  const [confirmClear, setConfirmClear] = useState(false)

  const archived = useMemo(() => {
    const list = tasks.filter((t) => t.status === 'archived' || t.status === 'completed')
    const sorted = list.sort((a, b) =>
      new Date(b.completedAt || b.createdAt) - new Date(a.completedAt || a.createdAt)
    )
    if (!search) return sorted
    return sorted.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))
  }, [tasks, search])

  const handleClear = () => {
    if (!confirmClear) {
      setConfirmClear(true)
      setTimeout(() => setConfirmClear(false), 3000)
      return
    }
    clearArchive()
    setConfirmClear(false)
    setSearch('')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        flexShrink: 0,
        background: 'rgba(15,15,20,0.97)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid #252530',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        zIndex: 10,
      }}>
        {/* Title row */}
        <div style={{ height: 56, paddingLeft: 16, paddingRight: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => onTabChange?.('tasks')}
            style={{
              width: 36, height: 36, borderRadius: 11,
              background: '#1a1a22', border: '1px solid #252530',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0,
            }}
          >
            <ArrowLeft size={16} color="#f0f0f8" />
          </button>

          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#f0f0f8', letterSpacing: '-0.3px', flex: 1, margin: 0 }}>
            งานที่เสร็จแล้ว
          </h1>

          {/* Count badge */}
          {archived.length > 0 && !search && (
            <span style={{
              fontSize: 12, fontWeight: 700,
              padding: '2px 10px', borderRadius: 99,
              background: '#252530', color: '#6b6b88',
            }}>
              {archived.length}
            </span>
          )}

          {/* Clear history button */}
          {archived.length > 0 && (
            <AnimatePresence mode="wait">
              <motion.button
                key={confirmClear ? 'confirm' : 'icon'}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.15 }}
                onClick={handleClear}
                style={{
                  height: 34,
                  padding: '0 12px',
                  borderRadius: 10,
                  border: `1px solid ${confirmClear ? 'rgba(239,68,68,0.4)' : '#252530'}`,
                  background: confirmClear ? 'rgba(239,68,68,0.10)' : '#1a1a22',
                  color: confirmClear ? '#f87171' : '#6b6b88',
                  fontSize: 12, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit',
                  display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0,
                  whiteSpace: 'nowrap',
                }}
              >
                {confirmClear ? (
                  'ยืนยันลบ?'
                ) : (
                  <>
                    <Trash2 size={12} />
                    ล้างประวัติ
                  </>
                )}
              </motion.button>
            </AnimatePresence>
          )}
        </div>

        {/* Search bar */}
        <div style={{ padding: '0 16px 12px', position: 'relative' }}>
          <Search
            size={14}
            color="#6b6b88"
            style={{ position: 'absolute', left: 30, top: '50%', transform: 'translateY(-60%)', pointerEvents: 'none' }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหา..."
            style={{
              width: '100%', height: 42,
              background: '#1a1a22',
              border: '1px solid #252530',
              borderRadius: 12,
              padding: '0 40px 0 38px',
              fontSize: 14, color: '#f0f0f8',
              outline: 'none', fontFamily: 'inherit',
              colorScheme: 'dark',
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                position: 'absolute', right: 28, top: '50%', transform: 'translateY(-60%)',
                background: 'none', border: 'none', cursor: 'pointer', padding: 4,
              }}
            >
              <X size={13} color="#6b6b88" />
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div
        className="no-scrollbar"
        style={{ flex: 1, overflowY: 'auto', padding: '14px 16px 80px', display: 'flex', flexDirection: 'column' }}
      >
        {archived.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}
            >
              <div style={{
                width: 76, height: 76, borderRadius: 22,
                background: 'linear-gradient(145deg, rgba(107,107,136,0.12) 0%, rgba(37,37,48,0.8) 100%)',
                border: '1px solid #252530',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="34" height="34" viewBox="0 0 34 34" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 27h26" stroke="#3b3b50" strokeWidth="1.7"/>
                  <path d="M8 27V14" stroke="#3b3b50" strokeWidth="1.7"/>
                  <path d="M17 27V10" stroke="#3b3b50" strokeWidth="1.7"/>
                  <path d="M26 27V17" stroke="#3b3b50" strokeWidth="1.7"/>
                  <path d="M8 14l9-4 9 3" stroke="#3b3b50" strokeWidth="1.7" strokeOpacity="0.5"/>
                </svg>
              </div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#f0f0f8', marginBottom: 5 }}>
                  {search ? 'ไม่พบ task ที่ค้นหา' : 'ยังไม่มีงานที่เสร็จ'}
                </p>
                <p style={{ fontSize: 13, color: '#6b6b88' }}>
                  {search ? 'ลองค้นหาด้วยคำอื่น' : 'Task ที่ทำเสร็จจะมาอยู่ที่นี่'}
                </p>
              </div>
            </motion.div>
          </div>
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
