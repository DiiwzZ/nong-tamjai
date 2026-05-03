import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ArrowLeft, Trash2, Plus, Check } from 'lucide-react'
import { useStore } from '@/store/useStore'

/* ── Color palette for categories ── */
const COLORS = [
  '#3b82f6', '#8b5cf6', '#f59e0b', '#10b981',
  '#ef4444', '#f97316', '#06b6d4', '#ec4899',
  '#84cc16', '#a78bfa', '#fb7185', '#6b7280',
]

/* ── Section label ── */
function SectionLabel({ children }) {
  return (
    <p style={{
      fontSize: 11, fontWeight: 800, color: '#3b3b50',
      textTransform: 'uppercase', letterSpacing: '0.12em',
      paddingLeft: 4, margin: '24px 0 8px',
    }}>
      {children}
    </p>
  )
}

/* ── Category row ── */
function CategoryRow({ cat, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false)
  const [label, setLabel] = useState(cat.label)
  const [color, setColor] = useState(cat.color)
  const [confirmDel, setConfirmDel] = useState(false)

  const save = () => {
    if (label.trim()) onUpdate(cat.id, { label: label.trim(), color })
    setEditing(false)
  }

  return (
    <div style={{
      background: '#1a1a22', borderRadius: 14, marginBottom: 2,
      border: `1px solid ${editing ? '#3b3b50' : 'transparent'}`,
      overflow: 'hidden', transition: 'border-color 0.18s',
    }}>
      {/* Main row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 14px' }}>
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: color, flexShrink: 0 }} />
        <span style={{ flex: 1, fontSize: 15, fontWeight: 600, color: '#f0f0f8' }}>{cat.label}</span>

        <button
          type="button"
          onClick={() => { setEditing(!editing); setConfirmDel(false) }}
          style={{
            fontSize: 12, fontWeight: 700, color: '#6b6b88',
            background: 'none', border: 'none', cursor: 'pointer', padding: '2px 8px',
          }}
        >
          {editing ? 'ยกเลิก' : 'แก้ไข'}
        </button>

        <button
          type="button"
          onClick={() => {
            if (!confirmDel) { setConfirmDel(true); setTimeout(() => setConfirmDel(false), 2500) }
            else { onDelete(cat.id) }
          }}
          style={{
            width: 30, height: 30, borderRadius: 9, flexShrink: 0,
            background: confirmDel ? 'rgba(239,68,68,0.14)' : 'transparent',
            border: confirmDel ? '1px solid rgba(239,68,68,0.3)' : '1px solid transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.15s',
          }}
        >
          <Trash2 size={13} color={confirmDel ? '#f87171' : '#4a4a60'} />
        </button>
      </div>

      {/* Edit panel */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden', borderTop: '1px solid #252530' }}
          >
            <div style={{ padding: '14px 14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Name input */}
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                style={{
                  width: '100%', height: 44,
                  background: '#0f0f14', border: '1px solid #252530',
                  borderRadius: 11, padding: '0 12px',
                  fontSize: 16, fontWeight: 600, color: '#f0f0f8',
                  outline: 'none', fontFamily: 'inherit', colorScheme: 'dark',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
                onBlur={(e) => (e.target.style.borderColor = '#252530')}
              />

              {/* Color swatches */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: c, border: `2px solid ${color === c ? '#fff' : 'transparent'}`,
                      cursor: 'pointer', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'border-color 0.15s',
                    }}
                  >
                    {color === c && <Check size={13} color="#fff" strokeWidth={3} />}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={save}
                style={{
                  height: 40, borderRadius: 11,
                  background: '#3b82f6', border: 'none',
                  color: '#fff', fontSize: 14, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                บันทึก
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Add Category form ── */
function AddCategoryRow({ onAdd }) {
  const [open, setOpen] = useState(false)
  const [label, setLabel] = useState('')
  const [color, setColor] = useState('#3b82f6')

  const submit = () => {
    if (!label.trim()) return
    onAdd({ label: label.trim(), color })
    setLabel('')
    setColor('#3b82f6')
    setOpen(false)
  }

  return (
    <div style={{ background: '#1a1a22', borderRadius: 14, marginBottom: 2, overflow: 'hidden' }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          width: '100%', height: 46, padding: '0 14px',
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        <Plus size={14} color="#3b82f6" />
        <span style={{ fontSize: 14, fontWeight: 600, color: '#3b82f6' }}>เพิ่มหมวดหมู่</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ overflow: 'hidden', borderTop: '1px solid #252530' }}
          >
            <div style={{ padding: '14px 14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="ชื่อหมวดหมู่..."
                style={{
                  width: '100%', height: 44,
                  background: '#0f0f14', border: '1px solid #252530',
                  borderRadius: 11, padding: '0 12px',
                  fontSize: 16, fontWeight: 600, color: '#f0f0f8',
                  outline: 'none', fontFamily: 'inherit', colorScheme: 'dark',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
                onBlur={(e) => (e.target.style.borderColor = '#252530')}
              />
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: c, border: `2px solid ${color === c ? '#fff' : 'transparent'}`,
                      cursor: 'pointer', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'border-color 0.15s',
                    }}
                  >
                    {color === c && <Check size={13} color="#fff" strokeWidth={3} />}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={submit}
                style={{
                  height: 40, borderRadius: 11,
                  background: label.trim() ? '#3b82f6' : '#1e1e28',
                  border: 'none', color: label.trim() ? '#fff' : '#3b3b50',
                  fontSize: 14, fontWeight: 700,
                  cursor: label.trim() ? 'pointer' : 'default',
                  fontFamily: 'inherit', transition: 'all 0.18s',
                }}
              >
                เพิ่ม
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Notification permission row ── */
function NotificationRow() {
  const [status, setStatus] = useState(() => {
    if (!('Notification' in window)) return 'unsupported'
    return Notification.permission
  })

  const requestPermission = async () => {
    if (!('Notification' in window)) return
    const result = await Notification.requestPermission()
    setStatus(result)
  }

  const statusLabel = {
    granted: 'เปิดอยู่',
    denied: 'ถูกบล็อก',
    default: 'ยังไม่ได้อนุญาต',
    unsupported: 'ไม่รองรับ',
  }[status]

  const statusColor = {
    granted: '#4ade80',
    denied: '#f87171',
    default: '#f59e0b',
    unsupported: '#6b6b88',
  }[status]

  return (
    <div style={{
      background: '#1a1a22', borderRadius: 14, marginBottom: 2,
      padding: '13px 14px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      <div>
        <p style={{ fontSize: 15, fontWeight: 600, color: '#f0f0f8', marginBottom: 2 }}>การแจ้งเตือน</p>
        <p style={{ fontSize: 12, color: statusColor, fontWeight: 600 }}>{statusLabel}</p>
      </div>
      {status === 'default' && (
        <button
          type="button"
          onClick={requestPermission}
          style={{
            height: 34, padding: '0 14px', borderRadius: 10,
            background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)',
            color: '#3b82f6', fontSize: 13, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          เปิดใช้งาน
        </button>
      )}
    </div>
  )
}

/* ── Main Settings page ── */
export function Settings({ onClose }) {
  const {
    userName, setUserName,
    categories, addCategory, updateCategory, deleteCategory,
    tasks, subscriptions,
    clearArchive, clearAllData,
  } = useStore()

  const [nameVal, setNameVal] = useState(userName)
  const [confirmClear, setConfirmClear] = useState(false)   // clear archive
  const [confirmReset, setConfirmReset] = useState(false)   // clear all

  const archiveCount = tasks.filter((t) => t.status === 'completed' || t.status === 'archived').length

  const handleNameBlur = () => {
    if (nameVal.trim() !== userName) setUserName(nameVal.trim())
  }

  const handleClearArchive = () => {
    if (!confirmClear) {
      setConfirmClear(true)
      setTimeout(() => setConfirmClear(false), 3000)
      return
    }
    clearArchive()
    setConfirmClear(false)
  }

  const handleClearAll = () => {
    if (!confirmReset) {
      setConfirmReset(true)
      setTimeout(() => setConfirmReset(false), 3000)
      return
    }
    clearAllData()
    setConfirmReset(false)
  }

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
      }}>
        <div style={{ height: 56, paddingLeft: 16, paddingRight: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
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
            ตั้งค่า
          </h1>
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '4px 16px 60px' }}>

        {/* ─ โปรไฟล์ ─ */}
        <SectionLabel>โปรไฟล์</SectionLabel>
        <div style={{
          background: '#1a1a22', borderRadius: 14, padding: '13px 14px',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12, flexShrink: 0,
            background: 'rgba(59,130,246,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 800, color: '#3b82f6',
          }}>
            {nameVal?.[0]?.toUpperCase() || '?'}
          </div>
          <input
            value={nameVal}
            onChange={(e) => setNameVal(e.target.value)}
            onBlur={handleNameBlur}
            placeholder="ชื่อของคุณ..."
            style={{
              flex: 1, height: 40,
              background: '#0f0f14', border: '1px solid #252530',
              borderRadius: 11, padding: '0 12px',
              fontSize: 16, fontWeight: 600, color: '#f0f0f8',
              outline: 'none', fontFamily: 'inherit', colorScheme: 'dark',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
            onBlur={(e) => { handleNameBlur(); e.target.style.borderColor = '#252530' }}
          />
        </div>

        {/* ─ การแจ้งเตือน ─ */}
        <SectionLabel>การแจ้งเตือน</SectionLabel>
        <NotificationRow />

        {/* ─ หมวดหมู่ ─ */}
        <SectionLabel>หมวดหมู่งาน</SectionLabel>
        {categories.map((cat) => (
          <CategoryRow
            key={cat.id}
            cat={cat}
            onUpdate={updateCategory}
            onDelete={deleteCategory}
          />
        ))}
        <AddCategoryRow onAdd={addCategory} />

        {/* ─ ข้อมูล ─ */}
        <SectionLabel>ข้อมูล</SectionLabel>

        {/* Stats row */}
        <div style={{
          background: '#1a1a22', borderRadius: 14, padding: '13px 14px',
          display: 'flex', gap: 0, marginBottom: 2,
        }}>
          {[
            { label: 'งาน', value: tasks.filter(t => t.status === 'active').length },
            { label: 'Subscriptions', value: subscriptions.length },
            { label: 'เสร็จแล้ว', value: archiveCount },
          ].map((item, i, arr) => (
            <div key={item.label} style={{
              flex: 1, textAlign: 'center',
              borderRight: i < arr.length - 1 ? '1px solid #252530' : 'none',
            }}>
              <p style={{ fontSize: 22, fontWeight: 800, color: '#f0f0f8', lineHeight: 1, marginBottom: 4 }}>
                {item.value}
              </p>
              <p style={{ fontSize: 11, color: '#6b6b88', fontWeight: 600 }}>{item.label}</p>
            </div>
          ))}
        </div>

        {/* Clear archive */}
        {archiveCount > 0 && (
          <motion.button
            key={confirmClear ? 'c1' : 'c0'}
            type="button"
            onClick={handleClearArchive}
            whileTap={{ scale: 0.98 }}
            style={{
              width: '100%', height: 48, borderRadius: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0 14px', marginBottom: 2,
              background: '#1a1a22',
              border: `1px solid ${confirmClear ? 'rgba(239,68,68,0.3)' : 'transparent'}`,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'border-color 0.18s',
            }}
          >
            <span style={{ fontSize: 15, fontWeight: 600, color: confirmClear ? '#f87171' : '#f0f0f8' }}>
              {confirmClear ? 'ยืนยันล้างประวัติ?' : 'ล้างประวัติงาน'}
            </span>
            <span style={{
              fontSize: 12, fontWeight: 700, color: '#6b6b88',
              padding: '2px 8px', borderRadius: 7, background: '#252530',
            }}>
              {archiveCount} รายการ
            </span>
          </motion.button>
        )}

        {/* Clear all data */}
        <motion.button
          key={confirmReset ? 'r1' : 'r0'}
          type="button"
          onClick={handleClearAll}
          whileTap={{ scale: 0.98 }}
          style={{
            width: '100%', height: 48, borderRadius: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 14px', marginBottom: 2,
            background: confirmReset ? 'rgba(239,68,68,0.06)' : '#1a1a22',
            border: `1px solid ${confirmReset ? 'rgba(239,68,68,0.3)' : 'transparent'}`,
            cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.18s',
          }}
        >
          <span style={{ fontSize: 15, fontWeight: 600, color: '#f87171' }}>
            {confirmReset ? 'ยืนยัน? จะหายถาวร' : 'ล้างข้อมูลทั้งหมด'}
          </span>
          <Trash2 size={15} color="#f87171" strokeWidth={2} />
        </motion.button>

        {/* App version */}
        <p style={{
          fontSize: 11, color: '#2a2a38', fontWeight: 600,
          textAlign: 'center', marginTop: 28,
        }}>
          MyFlow · v1.0.0
        </p>
      </div>
    </div>
  )
}
