import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence, useMotionValue, animate } from 'motion/react'
import { ArrowLeft, Plus, X } from 'lucide-react'
import { QuickAddFAB } from '@/components/ui/QuickAdd'
import { SubSkeleton } from '@/components/ui/Skeleton'
import { PageHeader } from '@/components/layout/PageHeader'
import { formatCurrency } from '@/lib/utils'
import {
  getSubscriptionBillingCycle,
  getSubscriptionMonthlyAmount,
  getSubscriptionPaymentMode,
  getSubscriptionTimeline,
} from '@/lib/subscriptions'
import { useStore } from '@/store/useStore'

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
  }, [value, format, mv])

  return <span>{display}</span>
}

const STATUS_COLOR = {
  active: '#4ade80',
  trial: '#3b82f6',
  paused: '#f59e0b',
  cancelled: '#6b6b88',
}

const STATUS_LABEL = {
  active: 'Active',
  trial: 'Trial',
  paused: 'Paused',
  cancelled: 'Cancelled',
}

const BILLING_CYCLES = [
  { id: 'monthly', label: 'รายเดือน' },
  { id: 'yearly', label: 'รายปี' },
]

const PAYMENT_MODES = [
  { id: 'auto', label: 'ตัดอัตโนมัติ' },
  { id: 'manual', label: 'กดจ่ายเอง' },
]

const PAYMENT_METHODS = ['เดบิต', 'เครดิต', 'PromptPay', 'อื่นๆ']

const POPULAR_SUBS = [
  { name: 'Netflix', color: '#E50914' },
  { name: 'Spotify', color: '#1DB954' },
  { name: 'YouTube Premium', color: '#FF0000' },
  { name: 'iCloud+', color: '#0071E3' },
  { name: 'ChatGPT', color: '#10a37f' },
  { name: 'Adobe CC', color: '#FA0F00' },
  { name: 'Claude', color: '#D97706' },
  { name: 'LINE TV', color: '#06C755' },
]

const inp = {
  width: '100%',
  minWidth: 0,
  boxSizing: 'border-box',
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

const lbl = {
  display: 'block',
  fontSize: 12,
  fontWeight: 700,
  color: '#6b6b88',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  marginBottom: 8,
}

function getBillingCycleLabel(sub) {
  return BILLING_CYCLES.find((item) => item.id === getSubscriptionBillingCycle(sub))?.label || ''
}

function getPaymentModeLabel(sub) {
  return PAYMENT_MODES.find((item) => item.id === getSubscriptionPaymentMode(sub))?.label || ''
}

function TogglePill({ active, children, onClick, color = '#3b82f6', flex = 1 }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flex,
        height: 48,
        padding: flex === 1 ? undefined : '0 18px',
        borderRadius: 13,
        border: `1.5px solid ${active ? color : '#252530'}`,
        background: active ? `${color}1a` : '#0f0f14',
        color: active ? color : '#6b6b88',
        fontSize: 14,
        fontWeight: 700,
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'all 0.15s',
      }}
    >
      {children}
    </button>
  )
}

function SubCard({ sub, onTap }) {
  const timeline = getSubscriptionTimeline(sub)
  const isCancelled = sub.status === 'cancelled'
  const statusColor = STATUS_COLOR[sub.status] || STATUS_COLOR.active
  const statusLabel = STATUS_LABEL[sub.status] || 'Active'
  const billingLabel = getBillingCycleLabel(sub)
  const paymentModeLabel = getPaymentModeLabel(sub)
  const emphasisColor = timeline.isOverdue ? '#f87171' : timeline.isUrgent ? '#f59e0b' : '#6b6b88'
  const cardBorder = timeline.isOverdue
    ? 'rgba(239,68,68,0.26)'
    : timeline.isUrgent
    ? 'rgba(245,158,11,0.22)'
    : '#252530'
  const cardBg = timeline.isOverdue
    ? 'rgba(239,68,68,0.05)'
    : timeline.isUrgent
    ? 'rgba(245,158,11,0.05)'
    : '#1a1a22'

  return (
    <div
      onClick={() => onTap(sub)}
      style={{
        background: cardBg,
        border: `1px solid ${cardBorder}`,
        borderRadius: 18,
        padding: '14px 16px',
        marginBottom: 10,
        cursor: 'pointer',
        opacity: isCancelled ? 0.5 : 1,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: 14,
            flexShrink: 0,
            background: sub.color || '#6b7280',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 19,
            fontWeight: 800,
            color: '#fff',
          }}
        >
          {sub.name?.[0]?.toUpperCase()}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4, flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: '#f0f0f8',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {sub.name}
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: 99,
                flexShrink: 0,
                background: `${statusColor}20`,
                color: statusColor,
              }}
            >
              {statusLabel}
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: 99,
                flexShrink: 0,
                background: timeline.isManual ? 'rgba(248,113,113,0.12)' : 'rgba(59,130,246,0.12)',
                color: timeline.isManual ? '#f87171' : '#3b82f6',
              }}
            >
              {paymentModeLabel}
            </span>
            {sub.split?.enabled && (sub.split?.members?.length ?? 0) > 1 && (
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: 99,
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  background: 'rgba(59,130,246,0.12)',
                  color: '#3b82f6',
                }}
              >
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                หาร {sub.split.members.length}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {sub.paymentMethod && (
              <span style={{ fontSize: 12, color: '#6b6b88' }}>{sub.paymentMethod}</span>
            )}
            {sub.paymentMethod && !isCancelled && timeline.shortLabel && (
              <span style={{ fontSize: 12, color: '#3b3b50' }}>•</span>
            )}
            {!isCancelled && timeline.shortLabel && (
              <span style={{ fontSize: 12, fontWeight: 600, color: emphasisColor }}>
                {timeline.shortLabel}
              </span>
            )}
          </div>
        </div>

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

function SubForm({ onClose, sub }) {
  const { addSubscription, updateSubscription, deleteSubscription, userName, setUserName } = useStore()
  const isEdit = !!sub

  const blank = {
    name: '',
    amount: '',
    billingCycle: 'monthly',
    paymentMode: 'auto',
    nextBillingDate: '',
    paymentMethod: 'เดบิต',
    status: 'active',
    alertDays: 3,
    color: '#6b7280',
    note: '',
    split: { enabled: false, type: 'equal', members: [] },
  }

  const [form, setForm] = useState(() =>
    sub
      ? {
          name: sub.name || '',
          amount: sub.amount || '',
          billingCycle: getSubscriptionBillingCycle(sub),
          paymentMode: getSubscriptionPaymentMode(sub),
          nextBillingDate: sub.nextBillingDate?.slice(0, 10) || '',
          paymentMethod: sub.paymentMethod || 'เดบิต',
          status: sub.status || 'active',
          alertDays: sub.alertDays || 3,
          color: sub.color || '#6b7280',
          note: sub.note || '',
          split: sub.split || { enabled: false, type: 'equal', members: [] },
        }
      : blank,
  )

  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const setSplit = (patch) =>
    setForm((current) => ({ ...current, split: { ...(current.split || {}), ...patch } }))

  const toggleSplit = () => {
    if (form.split?.enabled) {
      setSplit({ enabled: false })
      return
    }
    const me = userName.trim()
    setSplit({
      enabled: true,
      type: 'equal',
      members: me ? [{ id: crypto.randomUUID(), name: me, paid: true }] : [],
    })
  }

  const addMember = () => {
    const newMember = { id: crypto.randomUUID(), name: '', paid: false, share: 0 }
    setSplit({ members: [...(form.split?.members || []), newMember] })
  }

  const removeMember = (id) => {
    setSplit({ members: form.split.members.filter((member) => member.id !== id) })
  }

  const updateMember = (id, key, value) => {
    setSplit({
      members: form.split.members.map((member) =>
        member.id === id ? { ...member, [key]: value } : member,
      ),
    })
  }

  const totalAmt = parseFloat(form.amount) || 0
  const memberCount = form.split?.members?.length || 1
  const equalShare = memberCount > 0 ? Math.floor(totalAmt / memberCount) : 0
  const remainder = totalAmt - equalShare * memberCount
  const customTotal = (form.split?.members || []).reduce((sum, member) => sum + (parseFloat(member.share) || 0), 0)
  const customDiff = totalAmt - customTotal
  const canSubmit = form.name.trim() && form.amount

  const submit = () => {
    if (!canSubmit) return

    let splitData = { enabled: false, type: 'equal', members: [] }
    if (form.split?.enabled && (form.split?.members?.length ?? 0) > 0) {
      splitData = {
        ...form.split,
        members: form.split.members.map((member, index) => ({
          ...member,
          share:
            form.split.type === 'equal'
              ? index === 0
                ? equalShare + remainder
                : equalShare
              : parseFloat(member.share) || 0,
        })),
      }
    }

    const data = {
      ...form,
      amount: totalAmt,
      nextBillingDate: form.nextBillingDate ? new Date(form.nextBillingDate).toISOString() : null,
      split: splitData,
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0f0f14' }}>
      <div
        style={{
          flexShrink: 0,
          background: 'rgba(15,15,20,0.97)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid #252530',
          paddingTop: 'env(safe-area-inset-top, 0px)',
          zIndex: 10,
        }}
      >
        <div style={{ height: 56, paddingLeft: 16, paddingRight: 16, display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            aria-label="Back"
            onClick={onClose}
            style={{
              width: 36,
              height: 36,
              borderRadius: 11,
              background: '#1a1a22',
              border: '1px solid #252530',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <ArrowLeft size={16} color="#f0f0f8" />
          </button>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: '#f0f0f8', letterSpacing: '-0.3px', margin: 0 }}>
            {isEdit ? 'Edit Subscription' : 'New Subscription'}
          </h1>
        </div>
      </div>

      <div
        className="no-scrollbar"
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '20px 20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: 22,
          touchAction: 'pan-y',
          overscrollBehavior: 'none',
        }}
      >
        {!isEdit && (
          <div>
            <label style={lbl}>บริการยอดนิยม</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {POPULAR_SUBS.map((item) => {
                const isActive = form.name === item.name
                return (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => {
                      set('name', item.name)
                      set('color', item.color)
                    }}
                    style={{
                      height: 36,
                      padding: '0 12px 0 10px',
                      borderRadius: 10,
                      background: isActive ? `${item.color}18` : '#1a1a22',
                      color: isActive ? item.color : '#8b8ba8',
                      fontSize: 13,
                      fontWeight: 600,
                      border: `1.5px solid ${isActive ? `${item.color}55` : '#252530'}`,
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'all 0.18s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 7,
                    }}
                  >
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        flexShrink: 0,
                        background: item.color,
                        opacity: isActive ? 1 : 0.45,
                        transition: 'opacity 0.18s',
                      }}
                    />
                    {item.name}
                  </button>
                )
              })}
            </div>
          </div>
        )}

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

        <div>
          <label style={lbl}>รอบบิล</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {BILLING_CYCLES.map((item) => (
              <TogglePill
                key={item.id}
                active={form.billingCycle === item.id}
                onClick={() => set('billingCycle', item.id)}
              >
                {item.label}
              </TogglePill>
            ))}
          </div>
        </div>

        <div>
          <label style={lbl}>วิธีตัดเงิน</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {PAYMENT_MODES.map((item) => (
              <TogglePill
                key={item.id}
                active={form.paymentMode === item.id}
                onClick={() => set('paymentMode', item.id)}
                color={item.id === 'manual' ? '#f87171' : '#3b82f6'}
              >
                {item.label}
              </TogglePill>
            ))}
          </div>
        </div>

        <div>
          <label style={lbl}>วันรอบถัดไป</label>
          <div style={{ position: 'relative' }}>
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#6b6b88"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 1 }}
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <input
              type="date"
              value={form.nextBillingDate}
              onChange={(e) => set('nextBillingDate', e.target.value)}
              style={{ ...inp, paddingLeft: 42, WebkitAppearance: 'none', appearance: 'none' }}
              onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
              onBlur={(e) => (e.target.style.borderColor = '#252530')}
            />
          </div>
        </div>

        <div>
          <label style={lbl}>ช่องทางชำระเงิน</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {PAYMENT_METHODS.map((method) => (
              <TogglePill
                key={method}
                active={form.paymentMethod === method}
                onClick={() => set('paymentMethod', method)}
                flex={0}
              >
                {method}
              </TogglePill>
            ))}
          </div>
        </div>

        <div>
          <label style={lbl}>สถานะ</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {Object.entries(STATUS_LABEL).map(([key, value]) => (
              <TogglePill
                key={key}
                active={form.status === key}
                onClick={() => set('status', key)}
                color={STATUS_COLOR[key]}
                flex={0}
              >
                {value}
              </TogglePill>
            ))}
          </div>
        </div>

        <div>
          <label style={lbl}>แจ้งเตือนล่วงหน้า: {form.alertDays} วัน</label>
          <input
            type="range"
            min="1"
            max="14"
            value={form.alertDays}
            onChange={(e) => set('alertDays', parseInt(e.target.value, 10))}
            style={{ width: '100%', accentColor: '#3b82f6' }}
          />
        </div>

        <div style={{ borderTop: '1px solid #252530', paddingTop: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: form.split?.enabled ? 18 : 0 }}>
            <div>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#f0f0f8', marginBottom: 2 }}>หารกัน</p>
              <p style={{ fontSize: 12, color: '#6b6b88' }}>แยกค่า Subscription กับเพื่อน</p>
            </div>
            <div
              onClick={toggleSplit}
              style={{
                width: 48,
                height: 28,
                borderRadius: 14,
                background: form.split?.enabled ? '#3b82f6' : '#252530',
                position: 'relative',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'background 0.22s',
              }}
            >
              <motion.div
                animate={{ x: form.split?.enabled ? 22 : 2 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                style={{
                  position: 'absolute',
                  top: 4,
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: '#fff',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                }}
              />
            </div>
          </div>

          <AnimatePresence>
            {form.split?.enabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22 }}
                style={{ overflow: 'hidden' }}
              >
                {!userName && (
                  <div style={{ marginBottom: 16 }}>
                    <label style={lbl}>ชื่อของคุณ</label>
                    <input
                      placeholder="ชื่อคุณ..."
                      style={{ ...inp, flex: 1 }}
                      onBlur={(e) => {
                        const name = e.target.value.trim()
                        if (!name) return
                        setUserName(name)
                        if ((form.split?.members || []).length === 0) {
                          setSplit({ members: [{ id: crypto.randomUUID(), name, paid: true }] })
                        } else {
                          updateMember(form.split.members[0].id, 'name', name)
                        }
                      }}
                      onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
                      onBlurCapture={(e) => (e.target.style.borderColor = '#252530')}
                    />
                  </div>
                )}

                <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
                  {[
                    { id: 'equal', label: 'หารเท่ากัน' },
                    { id: 'custom', label: 'กำหนดเอง' },
                  ].map((item) => (
                    <TogglePill
                      key={item.id}
                      active={form.split.type === item.id}
                      onClick={() => setSplit({ type: item.id })}
                    >
                      {item.label}
                    </TogglePill>
                  ))}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
                  {(form.split?.members || []).map((member, index) => {
                    const isUser = index === 0
                    const shareDisplay =
                      form.split.type === 'equal'
                        ? formatCurrency(index === 0 ? equalShare + remainder : equalShare)
                        : null

                    return (
                      <div key={member.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, position: 'relative' }}>
                          <input
                            value={member.name}
                            onChange={(e) => {
                              updateMember(member.id, 'name', e.target.value)
                              if (isUser) setUserName(e.target.value)
                            }}
                            placeholder={isUser ? 'ชื่อคุณ...' : 'ชื่อเพื่อน...'}
                            style={{ ...inp, height: 50, paddingRight: isUser ? 52 : 16 }}
                            onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
                            onBlur={(e) => (e.target.style.borderColor = '#252530')}
                          />
                          {isUser && (
                            <span
                              style={{
                                position: 'absolute',
                                right: 12,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                fontSize: 11,
                                fontWeight: 700,
                                color: '#3b82f6',
                                background: 'rgba(59,130,246,0.12)',
                                padding: '2px 7px',
                                borderRadius: 6,
                              }}
                            >
                              คุณ
                            </span>
                          )}
                        </div>

                        {form.split.type === 'equal' ? (
                          <span style={{ fontSize: 14, fontWeight: 700, color: '#3b82f6', minWidth: 80, textAlign: 'right', flexShrink: 0 }}>
                            {shareDisplay}
                          </span>
                        ) : (
                          <input
                            type="number"
                            inputMode="decimal"
                            value={member.share || ''}
                            onChange={(e) => updateMember(member.id, 'share', e.target.value)}
                            placeholder="0"
                            style={{ ...inp, height: 50, width: 96, flexShrink: 0, padding: '0 12px', textAlign: 'right' }}
                            onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
                            onBlur={(e) => (e.target.style.borderColor = '#252530')}
                          />
                        )}

                        {!isUser ? (
                          <button
                            type="button"
                            onClick={() => removeMember(member.id)}
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: 12,
                              flexShrink: 0,
                              background: 'rgba(239,68,68,0.08)',
                              border: '1px solid rgba(239,68,68,0.2)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                            }}
                          >
                            <X size={14} color="#f87171" />
                          </button>
                        ) : (
                          <div style={{ width: 40, flexShrink: 0 }} />
                        )}
                      </div>
                    )
                  })}
                </div>

                <button
                  type="button"
                  onClick={addMember}
                  style={{
                    width: '100%',
                    height: 48,
                    borderRadius: 13,
                    border: '1.5px dashed #3b3b50',
                    background: 'transparent',
                    color: '#6b6b88',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    marginBottom: 12,
                  }}
                >
                  <Plus size={15} />
                  เพิ่มคน
                </button>

                {totalAmt > 0 && (form.split?.members?.length ?? 0) > 0 && (
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: 12,
                      background:
                        form.split.type === 'equal' || Math.abs(customDiff) < 0.01
                          ? 'rgba(74,222,128,0.06)'
                          : 'rgba(248,113,113,0.06)',
                      border: `1px solid ${
                        form.split.type === 'equal' || Math.abs(customDiff) < 0.01
                          ? 'rgba(74,222,128,0.18)'
                          : 'rgba(248,113,113,0.18)'
                      }`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ fontSize: 13, color: '#6b6b88' }}>
                      {form.split.type === 'equal'
                        ? `หาร ${memberCount} คน`
                        : Math.abs(customDiff) < 0.01
                        ? 'ครบยอด'
                        : customDiff > 0
                        ? `ขาดอีก ${formatCurrency(customDiff)}`
                        : `เกิน ${formatCurrency(-customDiff)}`}
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: form.split.type === 'equal' || Math.abs(customDiff) < 0.01 ? '#4ade80' : '#f87171',
                      }}
                    >
                      {form.split.type === 'equal'
                        ? `คุณจ่าย ${formatCurrency(totalAmt - equalShare * (memberCount - 1))}`
                        : `${formatCurrency(customTotal)} / ${formatCurrency(totalAmt)}`}
                    </span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {isEdit && (
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <button
              type="button"
              onClick={() => {
                updateSubscription(sub.id, { status: 'cancelled' })
                onClose()
              }}
              style={{
                flex: 1,
                height: 54,
                borderRadius: 16,
                border: '1px solid #252530',
                background: '#1a1a22',
                color: '#6b6b88',
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Cancel Sub
            </button>
            <button
              type="button"
              onClick={handleDelete}
              style={{
                flex: 1,
                height: 54,
                borderRadius: 16,
                border: '1px solid rgba(239,68,68,0.30)',
                background: 'rgba(239,68,68,0.08)',
                color: '#f87171',
                fontSize: 15,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Delete Subscription
            </button>
          </div>
        )}
      </div>

      <div
        style={{
          flexShrink: 0,
          padding: '12px 20px',
          paddingBottom: 'max(12px, env(safe-area-inset-bottom, 12px))',
          borderTop: '1px solid #252530',
          background: 'rgba(15,15,20,0.97)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        <motion.button
          type="button"
          onClick={submit}
          whileTap={{ scale: canSubmit ? 0.97 : 1 }}
          style={{
            width: '100%',
            height: 54,
            borderRadius: 15,
            background: canSubmit ? '#3b82f6' : '#1e1e28',
            border: 'none',
            color: canSubmit ? '#fff' : '#3b3b50',
            fontSize: 17,
            fontWeight: 700,
            cursor: canSubmit ? 'pointer' : 'default',
            fontFamily: 'inherit',
            transition: 'background 0.2s, color 0.2s',
            boxShadow: canSubmit ? '0 4px 20px rgba(59,130,246,0.35)' : 'none',
          }}
        >
          {isEdit ? 'Save' : 'Add Subscription'}
        </motion.button>
      </div>
    </div>
  )
}

export function Subscriptions({ onTabChange, onSettings }) {
  const { subscriptions } = useStore()
  const [formOpen, setFormOpen] = useState(false)
  const [editSub, setEditSub] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 380)
    return () => clearTimeout(timer)
  }, [])

  const active = useMemo(
    () => subscriptions.filter((sub) => sub.status !== 'cancelled'),
    [subscriptions],
  )

  const monthly = useMemo(
    () => active.reduce((sum, sub) => sum + getSubscriptionMonthlyAmount(sub), 0),
    [active],
  )

  const yearly = monthly * 12

  const sorted = useMemo(
    () =>
      [...subscriptions].sort((a, b) => {
        if (a.status === 'cancelled' && b.status !== 'cancelled') return 1
        if (a.status !== 'cancelled' && b.status === 'cancelled') return -1

        const aDate = getSubscriptionTimeline(a).nextBillingDate
        const bDate = getSubscriptionTimeline(b).nextBillingDate

        if (!aDate) return 1
        if (!bDate) return -1

        return new Date(aDate) - new Date(bDate)
      }),
    [subscriptions],
  )

  const handleTap = (sub) => {
    setEditSub(sub)
    setFormOpen(true)
  }

  const openNew = () => {
    setEditSub(null)
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditSub(null)
  }

  const headerRight =
    !loading && monthly > 0 ? (
      <span
        style={{
          fontSize: 15,
          fontWeight: 700,
          color: '#3b82f6',
          padding: '4px 12px',
          borderRadius: 10,
          background: 'rgba(59,130,246,0.10)',
          border: '1px solid rgba(59,130,246,0.18)',
        }}
      >
        <AnimatedNumber value={monthly} format={(value) => formatCurrency(value)} />
      </span>
    ) : null

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <PageHeader title="Subscriptions" right={headerRight} onSettings={onSettings} />

      <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 140px', display: 'flex', flexDirection: 'column' }}>
        {loading ? (
          <>{[0, 1, 2].map((index) => <SubSkeleton key={index} />)}</>
        ) : subscriptions.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, textAlign: 'center' }}
            >
              <motion.div
                initial={{ scale: 0.75, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.08, type: 'spring', stiffness: 260, damping: 22 }}
                style={{
                  width: 84,
                  height: 84,
                  borderRadius: 24,
                  background: 'linear-gradient(145deg, rgba(139,92,246,0.16) 0%, rgba(99,102,241,0.08) 100%)',
                  border: '1px solid rgba(139,92,246,0.24)',
                  boxShadow: '0 0 36px rgba(139,92,246,0.12), inset 0 1px 0 rgba(255,255,255,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="10" width="32" height="22" rx="5.5" stroke="#8b5cf6" strokeWidth="1.8" />
                  <path d="M4 17h32" stroke="#8b5cf6" strokeWidth="1.8" />
                  <rect x="8" y="22.5" width="10" height="5.5" rx="2" fill="rgba(139,92,246,0.22)" stroke="#8b5cf6" strokeWidth="1.6" />
                  <path d="M28 22.5a3 3 0 0 1 0 5.5" stroke="#8b5cf6" strokeWidth="1.6" strokeOpacity="0.7" />
                  <path d="M31 20.5a6 6 0 0 1 0 9.5" stroke="#8b5cf6" strokeWidth="1.6" strokeOpacity="0.4" />
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
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                background: '#1a1a22',
                border: '1px solid #252530',
                borderRadius: 20,
                padding: '20px 20px 18px',
                marginBottom: 16,
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#6b6b88',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: 8,
                }}
              >
                ค่าใช้จ่ายต่อเดือน
              </p>
              <p style={{ fontSize: 36, fontWeight: 800, color: '#3b82f6', lineHeight: 1, marginBottom: 6 }}>
                <AnimatedNumber value={monthly} format={(value) => formatCurrency(value)} />
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 13, color: '#6b6b88' }}>{active.length} subscriptions</span>
                {yearly > 0 && (
                  <>
                    <span style={{ fontSize: 13, color: '#3b3b50' }}>•</span>
                    <span style={{ fontSize: 13, color: '#6b6b88' }}>{formatCurrency(yearly)}/ปี</span>
                  </>
                )}
              </div>
            </motion.div>

            <AnimatePresence>
              {sorted.map((sub, index) => (
                <motion.div
                  key={sub.id}
                  layout
                  initial={{ opacity: 0, y: 12, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: -6, filter: 'blur(3px)', height: 0, marginBottom: 0 }}
                  transition={{ delay: index * 0.05, type: 'spring', stiffness: 350, damping: 28 }}
                >
                  <SubCard sub={sub} onTap={handleTap} />
                </motion.div>
              ))}
            </AnimatePresence>
          </>
        )}
      </div>

      {!formOpen && (
        <QuickAddFAB
          defaultAction="sub"
          onSelect={(type) => {
            if (type === 'sub') openNew()
            if (type === 'task') onTabChange?.('tasks')
          }}
        />
      )}

      <AnimatePresence>
        {formOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 34 }}
            style={{ position: 'absolute', inset: 0, zIndex: 20, overflow: 'hidden' }}
          >
            <SubForm onClose={closeForm} sub={editSub} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
