import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence, useMotionValue, animate } from 'motion/react'
import { ArrowLeft } from 'lucide-react'
import { QuickAddFAB } from '@/components/ui/QuickAdd'
import { SubSkeleton } from '@/components/ui/Skeleton'
import { PageHeader } from '@/components/layout/PageHeader'
import { formatCurrency, daysUntil } from '@/lib/utils'
import { useStore } from '@/store/useStore'

/* ── Animated counting number ── */
function AnimatedNumber({ value, format = String }) {
  const [display, setDisplay] = useState(() => format(value))
  const mv = useMotionValue(0)

  useEffect(() => {
    const ctrl = animate(mv, value, {
      duration: 0.7,
      ease: [0.25, 0.46, 0.45, 0.94],
      onUpdate: (v) => setDisplay(format(v)),
    })
    return ctrl.stop
  }, [value])

  return <span>{display}</span>
}

const STATUS_COLOR = {
  active:    '#4ade80',
  trial:     '#3b82f6',
  paused:    '#f59e0b',
  cancelled: '#6b6b88',
}
const STATUS_LABEL = {
  active:    'Active',
  trial:     'Trial',
  paused:    'Paused',
  cancelled: 'ยกเลิก',
}
const BILLING_CYCLES = [
  { id: 'monthly', label: 'รายเดือน' },
  { id: 'yearly',  label: 'รายปี' },
  { id: 'manual',  label: 'กดจ่ายเอง' },
]
const PAYMENT_METHODS = ['เดบิต', 'เครดิต', 'PromptPay', 'อื่นๆ']
const POPULAR_SUBS = [
  { name: 'Netflix',         color: '#E50914' },
  { name: 'Spotify',         color: '#1DB954' },
  { name: 'YouTube Premium', color: '#FF0000' },
  { name: 'iCloud',          color: '#3b82f6' },
  { name: 'ChatGPT',         color: '#10a37f' },
  { name: 'Adobe',           color: '#FF0000' },
]

/* ─── Input styles (shared in form) ─── */
const inp = {
  width: '100%', height: 52,
  background: '#0f0f14', border: '1px solid #252530',
  borderRadius: 14, padding: '0 16px',
  fontSize: 16, fontWeight: 500, color: '#f0f0f8',
  outline: 'none', fontFamily: 'inherit', colorScheme: 'dark',
}
const lbl = {
  display: 'block', fontSize: 12, fontWeight: 700, color: '#6b6b88',
  textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8,
}

/* ─── SubCard ─── */
function SubCard({ sub, onTap }) {
  const days = daysUntil(sub.nextBillingDate)
  const isUrgent = days !== null && days >= 0 && days <= 3
  const isCancelled = sub.status === 'cancelled'
  const statusColor = STATUS_COLOR[sub.status] || STATUS_COLOR.active
  const statusLabel = STATUS_LABEL[sub.status] || 'Active'
  const billingLabel = BILLING_CYCLES.find((b) => b.id === sub.billingCycle)?.label || ''

  return (
    <div
      onClick={() => onTap(sub)}
      style={{
        background: isUrgent ? 'rgba(239,68,68,0.05)' : '#1a1a22',
        border: `1px solid ${isUrgent ? 'rgba(239,68,68,0.22)' : '#252530'}`,
        borderRadius: 18, padding: '14px 16px',
        marginBottom: 10, cursor: 'pointer',
        opacity: isCancelled ? 0.5 : 1,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Avatar */}
        <div style={{
          width: 46, height: 46, borderRadius: 14, flexShrink: 0,
          background: sub.color || '#6b7280',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 19, fontWeight: 800, color: '#fff',
        }}>
          {sub.name?.[0]?.toUpperCase()}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
            <span style={{
              fontSize: 16, fontWeight: 600, color: '#f0f0f8',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {sub.name}
            </span>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99, flexShrink: 0,
              background: `${statusColor}20`, color: statusColor,
            }}>
              {statusLabel}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            {sub.paymentMethod && (
              <span style={{ fontSize: 12, color: '#6b6b88' }}>{sub.paymentMethod}</span>
            )}
            {days !== null && !isCancelled && (
              <>
                <span style={{ fontSize: 12, color: '#3b3b50' }}>·</span>
                <span style={{
                  fontSize: 12, fontWeight: 600,
                  color: isUrgent ? '#f87171' : '#6b6b88',
                }}>
                  {days < 0 ? 'เกินกำหนด' : days === 0 ? 'จ่ายวันนี้' : days === 1 ? 'พรุ่งนี้' : `อีก ${days} วัน`}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Amount */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <p style={{ fontSize: 17, fontWeight: 700, color: '#f0f0f8' }}>
            {formatCurrency(sub.amount)}
          </p>
          <p style={{ fontSize: 11, color: '#6b6b88', marginTop: 2 }}>{billingLabel}</p>
        </div>
      </div>
    </div>
  )
}

/* ─── SubForm — full-page slide-in ─── */
function SubForm({ onClose, sub }) {
  const { addSubscription, updateSubscription, deleteSubscription } = useStore()
  const isEdit = !!sub

  const blank = {
    name: '', amount: '', billingCycle: 'monthly',
    nextBillingDate: '', paymentMethod: 'เดบิต',
    status: 'active', alertDays: 3, color: '#6b7280', note: '',
  }

  const [form, setForm] = useState(() => sub ? {
    name: sub.name || '', amount: sub.amount || '',
    billingCycle: sub.billingCycle || 'monthly',
    nextBillingDate: sub.nextBillingDate?.slice(0, 10) || '',
    paymentMethod: sub.paymentMethod || 'เดบิต',
    status: sub.status || 'active',
    alertDays: sub.alertDays || 3,
    color: sub.color || '#6b7280',
    note: sub.note || '',
  } : blank)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const canSubmit = form.name.trim() && form.amount

  const submit = () => {
    if (!canSubmit) return
    const data = {
      ...form,
      amount: parseFloat(form.amount),
      nextBillingDate: form.nextBillingDate ? new Date(form.nextBillingDate).toISOString() : null,
    }
    if (isEdit) updateSubscription(sub.id, data)
    else addSubscription(data)
    onClose()
  }

  const handleDelete = () => {
    deleteSubscription(sub.id)
    onClose()
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: '#0f0f14',
    }}>
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
            {isEdit ? 'แก้ไข Subscription' : 'Subscription ใหม่'}
          </h1>
        </div>
      </div>

      {/* ── Scrollable fields ── */}
      <div
        className="no-scrollbar"
        style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 24px', display: 'flex', flexDirection: 'column', gap: 22 }}
      >
        {/* Popular presets */}
        {!isEdit && (
          <div>
            <label style={lbl}>บริการยอดนิยม</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {POPULAR_SUBS.map((item) => {
                const active = form.name === item.name
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => { set('name', item.name); set('color', item.color) }}
                    style={{
                      height: 36, padding: '0 14px', borderRadius: 10,
                      background: active ? item.color : `${item.color}22`,
                      color: active ? '#fff' : item.color,
                      fontSize: 13, fontWeight: 700,
                      border: `1.5px solid ${active ? item.color : `${item.color}55`}`,
                      cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                    }}
                  >{item.name}</button>
                )
              })}
            </div>
          </div>
        )}

        {/* Name */}
        <div>
          <label style={lbl}>ชื่อ</label>
          <input
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            placeholder="ชื่อ subscription..."
            style={inp}
            onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
            onBlur={(e) => (e.target.style.borderColor = '#252530')}
          />
        </div>

        {/* Amount */}
        <div>
          <label style={lbl}>ราคา (บาท)</label>
          <input
            type="number"
            inputMode="decimal"
            value={form.amount}
            onChange={(e) => set('amount', e.target.value)}
            placeholder="0"
            style={inp}
            onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
            onBlur={(e) => (e.target.style.borderColor = '#252530')}
          />
        </div>

        {/* Billing cycle */}
        <div>
          <label style={lbl}>รอบจ่าย</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {BILLING_CYCLES.map((b) => {
              const a = form.billingCycle === b.id
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => set('billingCycle', b.id)}
                  style={{
                    flex: 1, height: 48, borderRadius: 13,
                    border: `1.5px solid ${a ? '#3b82f6' : '#252530'}`,
                    background: a ? '#3b82f61a' : '#0f0f14',
                    color: a ? '#3b82f6' : '#6b6b88',
                    fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s',
                  }}
                >{b.label}</button>
              )
            })}
          </div>
        </div>

        {/* Next billing date */}
        <div>
          <label style={lbl}>วันจ่ายครั้งถัดไป</label>
          <input
            type="date"
            value={form.nextBillingDate}
            onChange={(e) => set('nextBillingDate', e.target.value)}
            style={{ ...inp }}
            onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
            onBlur={(e) => (e.target.style.borderColor = '#252530')}
          />
        </div>

        {/* Payment method */}
        <div>
          <label style={lbl}>ช่องทางชำระเงิน</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {PAYMENT_METHODS.map((m) => {
              const a = form.paymentMethod === m
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => set('paymentMethod', m)}
                  style={{
                    height: 44, padding: '0 16px', borderRadius: 12,
                    border: `1.5px solid ${a ? '#3b82f6' : '#252530'}`,
                    background: a ? '#3b82f61a' : '#0f0f14',
                    color: a ? '#3b82f6' : '#6b6b88',
                    fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >{m}</button>
              )
            })}
          </div>
        </div>

        {/* Status */}
        <div>
          <label style={lbl}>สถานะ</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {Object.entries(STATUS_LABEL).map(([key, val]) => {
              const a = form.status === key
              const c = STATUS_COLOR[key]
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => set('status', key)}
                  style={{
                    height: 44, padding: '0 16px', borderRadius: 12,
                    border: `1.5px solid ${a ? c : '#252530'}`,
                    background: a ? `${c}1a` : '#0f0f14',
                    color: a ? c : '#6b6b88',
                    fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >{val}</button>
              )
            })}
          </div>
        </div>

        {/* Alert days */}
        <div>
          <label style={lbl}>แจ้งเตือนล่วงหน้า: {form.alertDays} วัน</label>
          <input
            type="range"
            min="1"
            max="14"
            value={form.alertDays}
            onChange={(e) => set('alertDays', parseInt(e.target.value))}
            style={{ width: '100%', accentColor: '#3b82f6' }}
          />
        </div>

        {/* Delete (edit mode) */}
        {isEdit && (
          <button
            type="button"
            onClick={handleDelete}
            style={{
              width: '100%', height: 48, borderRadius: 13,
              border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)',
              color: '#f87171', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}
          >ลบ Subscription</button>
        )}
      </div>

      {/* ── Sticky submit ── */}
      <div style={{
        flexShrink: 0,
        padding: '12px 20px',
        paddingBottom: 'max(12px, env(safe-area-inset-bottom, 12px))',
        borderTop: '1px solid #252530',
        background: 'rgba(15,15,20,0.97)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}>
        <motion.button
          type="button"
          onClick={submit}
          whileTap={{ scale: canSubmit ? 0.97 : 1 }}
          style={{
            width: '100%', height: 54, borderRadius: 15,
            background: canSubmit ? '#3b82f6' : '#1e1e28',
            border: 'none',
            color: canSubmit ? '#fff' : '#3b3b50',
            fontSize: 17, fontWeight: 700,
            cursor: canSubmit ? 'pointer' : 'default',
            fontFamily: 'inherit',
            transition: 'background 0.2s, color 0.2s',
            boxShadow: canSubmit ? '0 4px 20px rgba(59,130,246,0.35)' : 'none',
          }}
        >
          {isEdit ? 'บันทึก' : 'เพิ่ม Subscription'}
        </motion.button>
      </div>
    </div>
  )
}

/* ─── Page ─── */
export function Subscriptions({ onTabChange }) {
  const { subscriptions } = useStore()
  const [formOpen, setFormOpen] = useState(false)
  const [editSub, setEditSub] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 380)
    return () => clearTimeout(t)
  }, [])

  const active = useMemo(() =>
    subscriptions.filter((s) => s.status !== 'cancelled'),
  [subscriptions])

  const monthly = useMemo(() =>
    active.reduce((sum, s) => {
      if (s.billingCycle === 'yearly')  return sum + s.amount / 12
      if (s.billingCycle === 'monthly') return sum + s.amount
      return sum
    }, 0),
  [active])

  const yearly = monthly * 12

  const sorted = useMemo(() =>
    [...subscriptions].sort((a, b) => {
      if (a.status === 'cancelled' && b.status !== 'cancelled') return 1
      if (a.status !== 'cancelled' && b.status === 'cancelled') return -1
      if (!a.nextBillingDate) return 1
      if (!b.nextBillingDate) return -1
      return new Date(a.nextBillingDate) - new Date(b.nextBillingDate)
    }),
  [subscriptions])

  const handleTap = (sub) => { setEditSub(sub); setFormOpen(true) }
  const openNew  = () => { setEditSub(null); setFormOpen(true) }
  const closeForm = () => { setFormOpen(false); setEditSub(null) }

  /* ── Header right: monthly amount pill ── */
  const headerRight = !loading && monthly > 0 ? (
    <span style={{
      fontSize: 15, fontWeight: 700, color: '#3b82f6',
      padding: '4px 12px', borderRadius: 10,
      background: 'rgba(59,130,246,0.10)',
      border: '1px solid rgba(59,130,246,0.18)',
    }}>
      <AnimatedNumber value={monthly} format={(v) => formatCurrency(v)} />
    </span>
  ) : null

  return (
    /* position:relative lets the form overlay sit inside this view */
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <PageHeader title="Subscriptions" right={headerRight} />

      <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 140px', display: 'flex', flexDirection: 'column' }}>
        {loading ? (
          <>{[0, 1, 2].map((i) => <SubSkeleton key={i} />)}</>
        ) : subscriptions.length === 0 ? (
          /* Empty state */
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, textAlign: 'center' }}
            >
              <motion.div
                initial={{ scale: 0.75, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.08, type: 'spring', stiffness: 260, damping: 22 }}
                style={{
                  width: 84, height: 84, borderRadius: 24,
                  background: 'linear-gradient(145deg, rgba(139,92,246,0.16) 0%, rgba(99,102,241,0.08) 100%)',
                  border: '1px solid rgba(139,92,246,0.24)',
                  boxShadow: '0 0 36px rgba(139,92,246,0.12), inset 0 1px 0 rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="10" width="32" height="22" rx="5.5" stroke="#8b5cf6" strokeWidth="1.8"/>
                  <path d="M4 17h32" stroke="#8b5cf6" strokeWidth="1.8"/>
                  <rect x="8" y="22.5" width="10" height="5.5" rx="2" fill="rgba(139,92,246,0.22)" stroke="#8b5cf6" strokeWidth="1.6"/>
                  <path d="M28 22.5a3 3 0 0 1 0 5.5" stroke="#8b5cf6" strokeWidth="1.6" strokeOpacity="0.7"/>
                  <path d="M31 20.5a6 6 0 0 1 0 9.5" stroke="#8b5cf6" strokeWidth="1.6" strokeOpacity="0.4"/>
                </svg>
              </motion.div>
              <div>
                <p style={{ fontSize: 18, fontWeight: 700, color: '#f0f0f8', marginBottom: 6 }}>ยังไม่มี Subscription</p>
                <p style={{ fontSize: 14, color: '#6b6b88' }}>กดปุ่ม + เพื่อเพิ่มรายการแรก</p>
              </div>
            </motion.div>
          </div>
        ) : (
          <>
            {/* Monthly summary card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
              style={{
                background: '#1a1a22', border: '1px solid #252530',
                borderRadius: 20, padding: '20px 20px 18px',
                marginBottom: 16,
              }}
            >
              <p style={{
                fontSize: 11, fontWeight: 700, color: '#6b6b88',
                textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8,
              }}>
                ค่าใช้จ่ายต่อเดือน
              </p>
              <p style={{ fontSize: 36, fontWeight: 800, color: '#3b82f6', lineHeight: 1, marginBottom: 6 }}>
                <AnimatedNumber value={monthly} format={(v) => formatCurrency(v)} />
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 13, color: '#6b6b88' }}>
                  {active.length} subscriptions
                </span>
                {yearly > 0 && (
                  <>
                    <span style={{ fontSize: 13, color: '#3b3b50' }}>·</span>
                    <span style={{ fontSize: 13, color: '#6b6b88' }}>
                      {formatCurrency(yearly)}/ปี
                    </span>
                  </>
                )}
              </div>
            </motion.div>

            {/* Sub list */}
            <AnimatePresence>
              {sorted.map((sub, i) => (
                <motion.div
                  key={sub.id} layout
                  initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -6, filter: 'blur(3px)', height: 0, marginBottom: 0 }}
                  transition={{ delay: i * 0.05, type: 'spring', stiffness: 350, damping: 28 }}
                >
                  <SubCard sub={sub} onTap={handleTap} />
                </motion.div>
              ))}
            </AnimatePresence>
          </>
        )}
      </div>

      {/* FAB — hidden while form is open */}
      {!formOpen && (
        <QuickAddFAB
          defaultAction="sub"
          onSelect={(type) => {
            if (type === 'sub') openNew()
            if (type === 'task') onTabChange?.('tasks')
          }}
        />
      )}

      {/* ── Full-page form: slides in from right ── */}
      <AnimatePresence>
        {formOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 34 }}
            style={{ position: 'absolute', inset: 0, zIndex: 20 }}
          >
            <SubForm onClose={closeForm} sub={editSub} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
