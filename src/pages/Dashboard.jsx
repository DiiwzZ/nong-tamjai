import { useMemo } from 'react'
import { motion } from 'motion/react'
import { CheckCircle2, AlertCircle, CreditCard, TrendingUp, Moon, Sun } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { cn, formatCurrency, daysUntil } from '@/lib/utils'
import { useStore } from '@/store/useStore'

/* ── Completion arc ring (inside hero card) ── */
function CompletionRing({ done, total, size = 72, stroke = 5 }) {
  const r    = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const pct  = total === 0 ? 0 : done / total

  return (
    <div className="relative flex-shrink-0">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" strokeWidth={stroke}
          stroke="rgba(255,255,255,0.15)" />
        <motion.circle
          cx={size/2} cy={size/2} r={r} fill="none" strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - pct) }}
          transition={{ duration: 1.4, ease: 'easeOut', delay: 0.2 }}
          stroke="white"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[18px] font-black text-white leading-none">{Math.round(pct * 100)}</span>
        <span className="text-[10px] font-bold text-white/50 leading-none">%</span>
      </div>
    </div>
  )
}

/* ── Stat tile ── */
function StatCard({ icon: Icon, label, value, sub, color, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 + index * 0.07, type: 'spring', stiffness: 300, damping: 28 }}
      className="rounded-2xl p-4 border border-border bg-card"
    >
      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3 flex-shrink-0', color)}>
        <Icon size={17} className="text-white" />
      </div>
      <p className="text-2xl font-black tracking-tighter text-foreground leading-none">{value}</p>
      <p className="text-[11px] font-semibold text-muted-foreground mt-1.5 leading-tight">{label}</p>
      {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
    </motion.div>
  )
}

/* ── Section header ── */
function SectionHeader({ label, count, overdue }) {
  return (
    <div className="flex items-center gap-2.5 mb-3">
      <span className={cn(
        'text-[10px] font-black uppercase tracking-[0.1em] flex-shrink-0',
        overdue ? 'text-destructive' : 'text-muted-foreground'
      )}>
        {label}
      </span>
      <div className={cn('h-px flex-1', overdue ? 'bg-destructive/25' : 'bg-border')} />
      {count != null && (
        <span className={cn(
          'text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0',
          overdue ? 'bg-destructive/15 text-destructive' : 'bg-muted text-muted-foreground'
        )}>
          {count}
        </span>
      )}
    </div>
  )
}

export function Dashboard() {
  const { tasks, subscriptions, darkMode, update } = useStore()

  const activeTasks    = tasks.filter((t) => t.status === 'active')
  const completedToday = tasks.filter((t) => {
    if (t.status !== 'completed') return false
    return new Date(t.completedAt).toDateString() === new Date().toDateString()
  })
  const overdue        = activeTasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date())
  const totalToday     = activeTasks.length + completedToday.length

  const activeSubs   = subscriptions.filter((s) => s.status === 'active')
  const monthlyTotal = activeSubs.reduce((sum, s) => {
    if (s.billingCycle === 'yearly')  return sum + s.amount / 12
    if (s.billingCycle === 'monthly') return sum + s.amount
    return sum
  }, 0)

  const upcomingSubs = subscriptions
    .filter((s) => s.status === 'active' && s.nextBillingDate)
    .map((s)    => ({ ...s, days: daysUntil(s.nextBillingDate) }))
    .filter((s) => s.days !== null && s.days >= 0 && s.days <= 14)
    .sort((a, b) => a.days - b.days)

  const chartData = useMemo(() => {
    const months = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      months.push({
        name:   d.toLocaleDateString('th-TH', { month: 'short' }),
        amount: monthlyTotal,
        active: i === 0,
      })
    }
    return months
  }, [monthlyTotal])

  return (
    /* ── Outer: flex col, no overflow here ── */
    <div className="flex flex-col h-full">

      {/* ══ Sticky header — own div, no overflow ══ */}
      <div className="px-5 bg-background sticky top-0 z-20 header-safe-top pb-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.1em]">
              {new Date().toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <h1 className="text-3xl font-black tracking-tighter text-foreground mt-0.5">น้องสรุปให้</h1>
          </div>
          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={() => update({ darkMode: !darkMode })}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-muted text-muted-foreground mb-0.5"
          >
            <motion.div
              key={darkMode ? 'sun' : 'moon'}
              initial={{ rotate: -30, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </motion.div>
          </motion.button>
        </div>
      </div>

      {/* ══ Scrollable content — separate div ══ */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 safe-bottom">

        {/* ── Hero: today's progress ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="rounded-3xl p-5 mb-4 overflow-hidden"
          style={{ background: 'linear-gradient(135deg, hsl(217 80% 38%), hsl(228 35% 14%))' }}
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.12em]">
                คืบหน้าวันนี้
              </p>
              <p className="text-5xl font-black text-white mt-2 tracking-tighter leading-none">
                {completedToday.length}
              </p>
              <p className="text-[13px] text-white/50 font-semibold mt-1.5">
                {activeTasks.length > 0
                  ? `ยังเหลืออีก ${activeTasks.length} งาน`
                  : completedToday.length > 0 ? 'ทำเสร็จหมดแล้ว!' : 'ยังไม่มีงานวันนี้'}
              </p>
              {overdue.length > 0 && (
                <p className="text-[12px] text-red-300 font-bold mt-1">
                  {overdue.length} งานเกินกำหนด
                </p>
              )}
            </div>
            <CompletionRing done={completedToday.length} total={totalToday} />
          </div>
        </motion.div>

        {/* ── 2×2 Stats grid ── */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <StatCard index={0} icon={CheckCircle2} label="งานวันนี้"
            value={`${completedToday.length}/${totalToday || 0}`}
            color="bg-emerald-500" />
          <StatCard index={1} icon={AlertCircle} label="เกินกำหนด"
            value={overdue.length}
            sub={overdue.length > 0 ? 'ต้องรีบแล้ว' : 'ดีมากเลย'}
            color={overdue.length > 0 ? 'bg-destructive' : 'bg-sky-500'} />
          <StatCard index={2} icon={CreditCard} label="Sub รายเดือน"
            value={formatCurrency(monthlyTotal)}
            sub={`${activeSubs.length} รายการ`}
            color="bg-violet-500" />
          <StatCard index={3} icon={TrendingUp} label="Sub รายปี"
            value={formatCurrency(monthlyTotal * 12)}
            color="bg-orange-500" />
        </div>

        {/* ── Upcoming payments ── */}
        {upcomingSubs.length > 0 && (
          <div className="mb-5">
            <SectionHeader label="จ่ายเร็วๆ นี้" count={upcomingSubs.length} />
            <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-5 px-5 pb-1">
              {upcomingSubs.map((sub, i) => (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, x: 14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className={cn(
                    'flex-shrink-0 w-36 rounded-2xl p-3.5 border',
                    sub.days <= 3
                      ? 'bg-red-500/8 border-red-500/25'
                      : 'bg-card border-border'
                  )}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-black mb-2.5"
                    style={{ backgroundColor: sub.color || '#6b7280' }}
                  >
                    {sub.name?.[0]?.toUpperCase()}
                  </div>
                  <p className="text-[13px] font-bold text-foreground truncate">{sub.name}</p>
                  <p className={cn(
                    'text-[11px] font-semibold mt-0.5',
                    sub.days <= 3 ? 'text-destructive' : 'text-muted-foreground'
                  )}>
                    {sub.days === 0 ? 'วันนี้!' : sub.days === 1 ? 'พรุ่งนี้' : `อีก ${sub.days} วัน`}
                  </p>
                  <p className="text-[13px] font-black text-foreground mt-1.5">
                    {formatCurrency(sub.amount)}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ── Bar chart ── */}
        {monthlyTotal > 0 && (
          <div className="mb-5">
            <SectionHeader label="ค่าใช้จ่าย 6 เดือน" />
            <div className="bg-card border border-border rounded-2xl p-4">
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={chartData} barSize={18} barCategoryGap="30%">
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)', fontFamily: 'Outfit' }}
                    axisLine={false} tickLine={false}
                  />
                  <YAxis hide />
                  <Tooltip
                    formatter={(v) => [formatCurrency(v), 'ค่าใช้จ่าย']}
                    contentStyle={{
                      backgroundColor: 'var(--color-card)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '10px',
                      fontSize: '12px',
                      fontFamily: 'Outfit',
                    }}
                    cursor={{ fill: 'var(--color-muted)', radius: 6 }}
                  />
                  <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, i) => (
                      <Cell key={i}
                        fill={entry.active ? 'var(--color-primary)' : 'var(--color-muted-foreground)'}
                        opacity={entry.active ? 1 : 0.35}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── Overdue tasks ── */}
        {overdue.length > 0 && (
          <div className="mb-5">
            <SectionHeader label="งานเกินกำหนด" count={overdue.length} overdue />
            <div className="flex flex-col gap-2">
              {overdue.map((task, i) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-3 p-3.5 rounded-2xl bg-destructive/8 border border-destructive/20"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-destructive flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-foreground truncate">{task.title}</p>
                    <p className="text-[11px] text-destructive font-medium mt-0.5">
                      {new Date(task.dueDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
