import { useMemo } from 'react'
import { motion } from 'motion/react'
import { CheckCircle2, AlertCircle, CreditCard, TrendingUp, ChartNoAxesColumn } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { cn, formatCurrency, daysUntil } from '@/lib/utils'
import { useStore } from '@/store/useStore'

function StatCard({ icon: Icon, label, value, sub, color, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, type: 'spring', stiffness: 300, damping: 28 }}
      className="rounded-[1.55rem] border border-white/6 bg-card/92 p-[18px] shadow-[0_18px_38px_-26px_rgba(0,0,0,0.95)]"
    >
      <div className={cn('mb-4 flex h-10 w-10 items-center justify-center rounded-[0.95rem]', color)}>
        <Icon size={18} />
      </div>
      <p className="text-[1.95rem] font-black leading-none tracking-[-0.045em] text-foreground">{value}</p>
      <p className="mt-1.5 text-[11px] font-semibold text-muted-foreground">{label}</p>
      {sub && <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p>}
    </motion.div>
  )
}

export function Dashboard() {
  const { tasks, subscriptions } = useStore()

  const activeTasks = tasks.filter((t) => t.status === 'active')
  const completedToday = tasks.filter((t) => {
    if (t.status !== 'completed') return false
    const completed = new Date(t.completedAt)
    const today = new Date()
    return completed.toDateString() === today.toDateString()
  })
  const overdue = activeTasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date())

  const activeSubs = subscriptions.filter((s) => s.status === 'active')
  const monthlyTotal = activeSubs.reduce((sum, s) => {
    if (s.billingCycle === 'yearly') return sum + s.amount / 12
    if (s.billingCycle === 'monthly') return sum + s.amount
    return sum
  }, 0)

  const upcomingSubs = subscriptions
    .filter((s) => s.status === 'active' && s.nextBillingDate)
    .map((s) => ({ ...s, days: daysUntil(s.nextBillingDate) }))
    .filter((s) => s.days !== null && s.days >= 0 && s.days <= 14)
    .sort((a, b) => a.days - b.days)

  const chartData = useMemo(() => {
    const months = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date()
      d.setMonth(d.getMonth() - i)
      months.push({
        name: d.toLocaleDateString('th-TH', { month: 'short' }),
        amount: monthlyTotal,
      })
    }
    return months
  }, [monthlyTotal])

  return (
    <div className="flex h-full flex-col">
      <div className="sticky top-0 z-20 bg-background/92 px-6 pb-5 backdrop-blur-xl header-safe-top">
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-medium text-muted-foreground">
              {new Date().toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>

            <motion.button
              whileTap={{ scale: 0.85 }}
              className="flex h-10 w-10 items-center justify-center rounded-[1rem] border border-white/6 bg-muted/68 text-primary"
            >
              <ChartNoAxesColumn size={17} />
            </motion.button>
          </div>

          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/78">
              daily snapshot
            </p>
            <h1 className="max-w-[16rem] text-balance text-[2.45rem] font-black leading-[0.9] tracking-[-0.055em] text-foreground">
              ภาพรวม
              <br />
              <span className="text-primary">
                {completedToday.length}/{activeTasks.length + completedToday.length} งาน
              </span>
            </h1>
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span className="rounded-full border border-white/6 bg-muted/52 px-3 py-1.5 font-medium">
                วันนี้เสร็จ {completedToday.length} งาน
              </span>
              <span className="rounded-full border border-white/6 bg-muted/52 px-3 py-1.5 font-medium">
                เกินกำหนด {overdue.length} งาน
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pt-3 pb-4 no-scrollbar safe-bottom">
        <div className="space-y-8">
          <section className="grid grid-cols-2 gap-3.5">
            <StatCard
              icon={CheckCircle2}
              label="งานวันนี้"
              value={`${completedToday.length}/${activeTasks.length + completedToday.length}`}
              color="bg-emerald-500/16 text-emerald-400"
              index={0}
            />
            <StatCard
              icon={AlertCircle}
              label="เกินกำหนด"
              value={overdue.length}
              sub={overdue.length > 0 ? 'ต้องรีบจัดการ' : 'ดีมาก'}
              color={overdue.length > 0 ? 'bg-destructive/16 text-destructive' : 'bg-primary/16 text-primary'}
              index={1}
            />
            <StatCard
              icon={CreditCard}
              label="ค่า Sub/เดือน"
              value={formatCurrency(monthlyTotal)}
              sub={`${activeSubs.length} รายการ`}
              color="bg-primary/16 text-primary"
              index={2}
            />
            <StatCard
              icon={TrendingUp}
              label="ค่า Sub/ปี"
              value={formatCurrency(monthlyTotal * 12)}
              color="bg-amber-500/16 text-amber-400"
              index={3}
            />
          </section>

          {upcomingSubs.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-[14px] font-black tracking-[-0.02em] text-foreground">จ่ายเร็วๆ นี้</h2>
                <span className="text-[12px] font-bold text-primary">ดูทั้งหมด</span>
              </div>

              <div className="space-y-4">
                {upcomingSubs.map((sub) => (
                  <motion.div
                    key={sub.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={cn(
                      'flex items-center gap-3.5 rounded-[1.55rem] border p-[18px] shadow-[0_18px_38px_-26px_rgba(0,0,0,0.95)]',
                      sub.days <= 3 ? 'border-red-900/60 bg-red-950/20' : 'border-white/6 bg-card/92'
                    )}
                  >
                    <div
                      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[0.9rem] text-xs font-bold text-white"
                      style={{ backgroundColor: sub.color || '#6b7280' }}
                    >
                      {sub.name?.[0]?.toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground">{sub.name}</p>
                      <p className={cn('text-xs', sub.days <= 3 ? 'text-destructive' : 'text-muted-foreground')}>
                        {sub.days === 0 ? 'วันนี้' : sub.days === 1 ? 'พรุ่งนี้' : `อีก ${sub.days} วัน`}
                      </p>
                    </div>

                    <p className="text-[15px] font-black tracking-[-0.02em] text-foreground">{formatCurrency(sub.amount)}</p>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {monthlyTotal > 0 && (
            <section className="space-y-4">
              <h2 className="text-[14px] font-black tracking-[-0.02em] text-foreground">ค่าใช้จ่าย 6 เดือน</h2>
              <div className="rounded-[1.6rem] border border-white/6 bg-card/92 p-4 shadow-[0_18px_38px_-26px_rgba(0,0,0,0.95)]">
                <ResponsiveContainer width="100%" height={168}>
                  <BarChart data={chartData} barSize={20}>
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis hide />
                    <Tooltip
                      formatter={(value) => [formatCurrency(value), 'ค่าใช้จ่าย']}
                      contentStyle={{
                        backgroundColor: 'var(--color-card)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="amount" radius={[6, 6, 0, 0]} fill="var(--color-primary)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}

          {overdue.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-[14px] font-black tracking-[-0.02em] text-destructive">งานเกินกำหนด</h2>
              <div className="space-y-3">
                {overdue.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-[1.45rem] border border-red-900/60 bg-red-950/20 p-4 shadow-[0_18px_38px_-26px_rgba(0,0,0,0.95)]"
                  >
                    <p className="text-sm font-semibold text-foreground">{task.title}</p>
                    <p className="mt-1 text-xs text-destructive">
                      {new Date(task.dueDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
