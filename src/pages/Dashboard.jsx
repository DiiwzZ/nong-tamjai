import { useMemo, useState, useEffect } from 'react'
import { motion, useMotionValue, animate } from 'motion/react'
import { useStore } from '@/store/useStore'
import { PageHeader } from '@/components/layout/PageHeader'
import { formatCurrency, daysUntil, isOverdue } from '@/lib/utils'

/* ── Animated counting number ── */
function AnimatedNumber({ value, format = String }) {
  const mv = useMotionValue(0)
  const [display, setDisplay] = useState(() => format(value))

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

function todayShort() {
  return new Date().toLocaleDateString('th-TH', {
    weekday: 'short', day: 'numeric', month: 'short',
  })
}

/* ── Monthly spending bar chart ── */
function SpendingChart({ subscriptions }) {
  const [selected, setSelected] = useState(5) // default: current month

  const data = useMemo(() => {
    const now = new Date()
    return Array.from({ length: 6 }, (_, i) => {
      const offset = 5 - i
      const d = new Date(now.getFullYear(), now.getMonth() - offset, 1)
      const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)

      let total = 0
      subscriptions.forEach((s) => {
        if (s.status === 'cancelled') return
        if (new Date(s.createdAt) > monthEnd) return
        if (s.billingCycle === 'monthly') total += Number(s.amount) || 0
        else if (s.billingCycle === 'yearly') total += (Number(s.amount) || 0) / 12
      })

      return {
        label:     d.toLocaleDateString('th-TH', { month: 'short' }),
        fullLabel: d.toLocaleDateString('th-TH', { month: 'long', year: 'numeric' }),
        amount:    total,
        isCurrent: offset === 0,
      }
    })
  }, [subscriptions])

  const max = Math.max(...data.map((d) => d.amount), 1)
  const sel = data[selected]

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.08 }}
      style={{
        background: '#1a1a22', border: '1px solid #252530',
        borderRadius: 20, padding: '18px 16px 14px',
        marginBottom: 20,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: '#6b6b88', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          ค่าใช้จ่าย 6 เดือน
        </p>
        <motion.p
          key={selected}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          style={{ fontSize: 15, fontWeight: 700, color: sel.isCurrent ? '#3b82f6' : '#f0f0f8' }}
        >
          {formatCurrency(sel.amount)}
        </motion.p>
      </div>

      {/* Bars */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 7, height: 90 }}>
        {data.map((d, i) => {
          const isSelected = i === selected
          const pct = Math.max((d.amount / max) * 100, d.amount > 0 ? 8 : 4)
          return (
            <div
              key={i}
              onClick={() => setSelected(i)}
              style={{
                flex: 1, height: '100%',
                display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                cursor: 'pointer',
              }}
            >
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: i * 0.06, type: 'spring', stiffness: 280, damping: 26 }}
                style={{
                  width: '100%',
                  height: `${pct}%`,
                  transformOrigin: 'bottom',
                  borderRadius: '5px 5px 3px 3px',
                  background: isSelected
                    ? '#3b82f6'
                    : d.isCurrent
                    ? 'rgba(59,130,246,0.35)'
                    : '#252535',
                  boxShadow: isSelected ? '0 0 14px rgba(59,130,246,0.30)' : 'none',
                  transition: 'background 0.15s, box-shadow 0.15s',
                }}
              />
            </div>
          )
        })}
      </div>

      {/* Month labels */}
      <div style={{ display: 'flex', gap: 7, marginTop: 7 }}>
        {data.map((d, i) => (
          <div
            key={i}
            onClick={() => setSelected(i)}
            style={{
              flex: 1, textAlign: 'center', cursor: 'pointer',
              fontSize: 10, fontWeight: 600,
              color: i === selected ? '#f0f0f8' : '#3b3b52',
              transition: 'color 0.15s',
            }}
          >
            {d.label}
          </div>
        ))}
      </div>

      {/* Selected detail */}
      <div style={{
        marginTop: 12, paddingTop: 10,
        borderTop: '1px solid #252530',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <motion.span
          key={selected}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.18 }}
          style={{ fontSize: 12, color: '#6b6b88' }}
        >
          {sel.fullLabel}
        </motion.span>
        <span style={{ fontSize: 12, color: '#4a4a62' }}>
          {subscriptions.filter((s) => s.status !== 'cancelled').length} subscriptions
        </span>
      </div>
    </motion.div>
  )
}

export function Dashboard({ onTabChange }) {
  const { tasks, subscriptions, categories } = useStore()

  const activeTasks = useMemo(() => tasks.filter((t) => t.status === 'active'), [tasks])
  const overdueTasks = useMemo(() => activeTasks.filter((t) => isOverdue(t.dueDate)), [activeTasks])

  const activeSubs = useMemo(() => subscriptions.filter((s) => s.status !== 'cancelled'), [subscriptions])
  const monthly = useMemo(() =>
    activeSubs.reduce((sum, s) => {
      if (s.billingCycle === 'yearly')  return sum + s.amount / 12
      if (s.billingCycle === 'monthly') return sum + s.amount
      return sum
    }, 0),
  [activeSubs])

  /* Upcoming payments ≤7 days */
  const upcoming = useMemo(() =>
    subscriptions
      .filter((s) => s.status !== 'cancelled' && s.nextBillingDate)
      .map((s) => ({ ...s, days: daysUntil(s.nextBillingDate) }))
      .filter((s) => s.days !== null && s.days >= 0 && s.days <= 7)
      .sort((a, b) => a.days - b.days),
  [subscriptions])

  /* Urgent tasks: overdue or due today/tomorrow */
  const urgentTasks = useMemo(() =>
    activeTasks
      .filter((t) => t.dueDate && daysUntil(t.dueDate) !== null && daysUntil(t.dueDate) <= 1)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5),
  [activeTasks])

  const isEmpty = activeTasks.length === 0 && subscriptions.length === 0

  const dateRight = (
    <span style={{ fontSize: 13, fontWeight: 500, color: '#6b6b88' }}>
      {todayShort()}
    </span>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <PageHeader title="ภาพรวม" right={dateRight} />

      <div
        className="no-scrollbar"
        style={{ flex: 1, overflowY: 'auto', padding: '20px 16px 140px', display: 'flex', flexDirection: 'column' }}
      >

      {/* Stat cards */}
      <motion.div
        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28 }}
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}
      >
        {/* Tasks card */}
        <div
          onClick={() => onTabChange?.('tasks')}
          style={{
            background: '#1a1a22', border: '1px solid #252530',
            borderRadius: 20, padding: '18px 16px', cursor: 'pointer',
          }}
        >
          <p style={{
            fontSize: 11, fontWeight: 700, color: '#6b6b88',
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10,
          }}>งานที่ต้องทำ</p>
          <p style={{ fontSize: 38, fontWeight: 800, color: '#f0f0f8', lineHeight: 1, marginBottom: 6 }}>
            <AnimatedNumber value={activeTasks.length} format={(v) => Math.round(v).toString()} />
          </p>
          {overdueTasks.length > 0 ? (
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 7,
              background: 'rgba(239,68,68,0.12)', color: '#f87171',
            }}>
              {overdueTasks.length} เกินกำหนด
            </span>
          ) : (
            <p style={{ fontSize: 12, color: '#6b6b88' }}>รายการ</p>
          )}
        </div>

        {/* Subs card */}
        <div
          onClick={() => onTabChange?.('subscriptions')}
          style={{
            background: '#1a1a22', border: '1px solid #252530',
            borderRadius: 20, padding: '18px 16px', cursor: 'pointer',
          }}
        >
          <p style={{
            fontSize: 11, fontWeight: 700, color: '#6b6b88',
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10,
          }}>รายเดือน</p>
          <p style={{
            fontSize: monthly >= 10000 ? 24 : 32,
            fontWeight: 800, color: '#3b82f6', lineHeight: 1, marginBottom: 6,
          }}>
            <AnimatedNumber value={monthly} format={(v) => formatCurrency(v)} />
          </p>
          <p style={{ fontSize: 12, color: '#6b6b88' }}>{activeSubs.length} subs</p>
        </div>
      </motion.div>

      {/* Spending chart — shown when there are any subs */}
      {subscriptions.length > 0 && (
        <SpendingChart subscriptions={subscriptions} />
      )}

      {/* Upcoming payments */}
      {upcoming.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.06 }}
          style={{ marginBottom: 20 }}
        >
          <p style={{
            fontSize: 12, fontWeight: 700, color: '#6b6b88',
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10,
          }}>จ่ายเงินเร็วๆ นี้</p>

          <div style={{ background: '#1a1a22', border: '1px solid #252530', borderRadius: 18, overflow: 'hidden' }}>
            {upcoming.map((sub, i) => (
              <div
                key={sub.id}
                onClick={() => onTabChange?.('subscriptions')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '13px 16px', cursor: 'pointer',
                  borderBottom: i < upcoming.length - 1 ? '1px solid #252530' : 'none',
                }}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: 11, flexShrink: 0,
                  background: sub.color || '#6b7280',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 15, fontWeight: 800, color: '#fff',
                }}>
                  {sub.name?.[0]?.toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: 15, fontWeight: 600, color: '#f0f0f8',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2,
                  }}>{sub.name}</p>
                  <p style={{
                    fontSize: 12, fontWeight: 500,
                    color: sub.days <= 1 ? '#f87171' : '#6b6b88',
                  }}>
                    {sub.days === 0 ? 'จ่ายวันนี้' : sub.days === 1 ? 'จ่ายพรุ่งนี้' : `อีก ${sub.days} วัน`}
                  </p>
                </div>
                <p style={{ fontSize: 15, fontWeight: 700, color: '#f0f0f8', flexShrink: 0 }}>
                  {formatCurrency(sub.amount)}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Urgent tasks */}
      {urgentTasks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.1 }}
          style={{ marginBottom: 20 }}
        >
          <p style={{
            fontSize: 12, fontWeight: 700, color: '#6b6b88',
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10,
          }}>งานด่วน</p>

          <div style={{ background: '#1a1a22', border: '1px solid #252530', borderRadius: 18, overflow: 'hidden' }}>
            {urgentTasks.map((task, i) => {
              const overdue = isOverdue(task.dueDate)
              const days = daysUntil(task.dueDate)
              const cat = categories?.find((c) => c.id === task.categoryId)
              const pColor = task.priority === 'high' ? '#ef4444' : task.priority === 'medium' ? '#f59e0b' : '#22c55e'

              return (
                <div
                  key={task.id}
                  onClick={() => onTabChange?.('tasks')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '13px 16px', cursor: 'pointer',
                    borderBottom: i < urgentTasks.length - 1 ? '1px solid #252530' : 'none',
                  }}
                >
                  <div style={{
                    width: 6, height: 6, borderRadius: 99, flexShrink: 0,
                    background: overdue ? '#ef4444' : pColor,
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: 15, fontWeight: 600, color: '#f0f0f8',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2,
                    }}>{task.title}</p>
                    <p style={{ fontSize: 12, fontWeight: 500, color: overdue ? '#f87171' : '#6b6b88' }}>
                      {overdue ? '⚠ เกินกำหนด' : days === 0 ? 'วันนี้' : 'พรุ่งนี้'}
                    </p>
                  </div>
                  {cat && (
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 7, flexShrink: 0,
                      background: `${cat.color}22`, color: cat.color,
                    }}>{cat.label}</span>
                  )}
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Empty */}
      {isEmpty && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 20, textAlign: 'center',
          }}
        >
          <motion.div
            initial={{ scale: 0.75, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.18, type: 'spring', stiffness: 260, damping: 22 }}
            style={{
              width: 84, height: 84, borderRadius: 24,
              background: 'linear-gradient(145deg, rgba(59,130,246,0.16) 0%, rgba(16,185,129,0.07) 100%)',
              border: '1px solid rgba(59,130,246,0.22)',
              boxShadow: '0 0 36px rgba(59,130,246,0.11), inset 0 1px 0 rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" strokeLinecap="round" strokeLinejoin="round">
              {/* Baseline */}
              <path d="M5 33h30" stroke="#3b82f6" strokeWidth="1.8"/>
              {/* Bar 1 — short */}
              <rect x="7" y="23" width="7" height="10" rx="2.5" fill="rgba(59,130,246,0.14)" stroke="#3b82f6" strokeWidth="1.7"/>
              {/* Bar 2 — mid */}
              <rect x="17" y="15" width="7" height="18" rx="2.5" fill="rgba(59,130,246,0.22)" stroke="#3b82f6" strokeWidth="1.7"/>
              {/* Bar 3 — tall */}
              <rect x="27" y="8" width="7" height="25" rx="2.5" fill="rgba(59,130,246,0.32)" stroke="#3b82f6" strokeWidth="1.7"/>
              {/* Trend arrow on top of bar 3 */}
              <path d="M13 20l6-5 6 3 6-8" stroke="#3b82f6" strokeWidth="1.7" strokeOpacity="0.5"/>
            </svg>
          </motion.div>
          <div>
            <p style={{ fontSize: 17, fontWeight: 700, color: '#f0f0f8', marginBottom: 6 }}>ยังไม่มีอะไร</p>
            <p style={{ fontSize: 14, color: '#6b6b88' }}>เพิ่ม task หรือ subscription เพื่อเริ่มต้น</p>
          </div>
        </motion.div>
        </div>
      )}
      </div>
    </div>
  )
}
