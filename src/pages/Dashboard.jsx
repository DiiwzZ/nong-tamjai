import { useMemo } from 'react'
import { motion } from 'motion/react'
import {
  AlertCircle,
  ChartNoAxesColumn,
  CheckCircle2,
  CreditCard,
  TrendingUp,
} from 'lucide-react'
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { cn, daysUntil, formatCurrency } from '@/lib/utils'
import { useStore } from '@/store/useStore'

function MetricTile({ icon: Icon, label, value, note, iconBg, iconColor, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, type: 'spring', stiffness: 300, damping: 28 }}
      className="rounded-[1.6rem] border border-white/[0.07] bg-card p-[18px] shadow-[0_22px_42px_-28px_rgba(0,0,0,1)]"
    >
      <div className={cn('mb-4 flex h-10 w-10 items-center justify-center rounded-[1rem]', iconBg)}>
        <Icon size={18} className={iconColor} />
      </div>
      <p className="numeric-tabular text-[1.95rem] font-black leading-none tracking-[-0.05em] text-foreground">{value}</p>
      <p className="mt-2 text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">{label}</p>
      {note && <p className="mt-2 text-xs leading-5 text-muted-foreground">{note}</p>}
    </motion.div>
  )
}

function DueRow({ sub, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      className={cn(
        'flex items-center gap-3.5 rounded-[1.45rem] border p-4 shadow-[0_20px_40px_-28px_rgba(0,0,0,1)]',
        sub.days <= 3
          ? 'border-red-900/55 bg-card'
          : 'border-white/[0.07] bg-card'
      )}
    >
      <div
        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[0.95rem] text-xs font-bold text-white"
        style={{ backgroundColor: sub.color || '#6B7280' }}
      >
        {sub.name?.[0]?.toUpperCase()}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold tracking-[-0.02em] text-foreground">{sub.name}</p>
        <p className={cn('mt-1 text-xs', sub.days <= 3 ? 'text-red-300' : 'text-muted-foreground')}>
          {sub.days === 0 ? 'จ่ายวันนี้' : sub.days === 1 ? 'จ่ายพรุ่งนี้' : `อีก ${sub.days} วัน`}
        </p>
      </div>

      <p className="numeric-tabular text-[15px] font-black tracking-[-0.03em] text-foreground">
        {formatCurrency(sub.amount)}
      </p>
    </motion.div>
  )
}

export function Dashboard() {
  const { tasks, subscriptions } = useStore()

  const activeTasks = tasks.filter((task) => task.status === 'active')
  const completedToday = tasks.filter((task) => {
    if (task.status !== 'completed') return false
    const completedAt = new Date(task.completedAt)
    const today = new Date()
    return completedAt.toDateString() === today.toDateString()
  })

  const totalToday = activeTasks.length + completedToday.length
  const completionRate = totalToday > 0 ? Math.round((completedToday.length / totalToday) * 100) : 0
  const overdue = activeTasks.filter((task) => task.dueDate && new Date(task.dueDate) < new Date())

  const activeSubs = subscriptions.filter((subscription) => subscription.status === 'active')
  const monthlyTotal = activeSubs.reduce((sum, subscription) => {
    if (subscription.billingCycle === 'yearly') return sum + subscription.amount / 12
    if (subscription.billingCycle === 'monthly') return sum + subscription.amount
    return sum
  }, 0)

  const upcomingSubs = subscriptions
    .filter((subscription) => subscription.status === 'active' && subscription.nextBillingDate)
    .map((subscription) => ({ ...subscription, days: daysUntil(subscription.nextBillingDate) }))
    .filter((subscription) => subscription.days !== null && subscription.days >= 0 && subscription.days <= 14)
    .sort((a, b) => a.days - b.days)

  const chartData = useMemo(() => {
    return Array.from({ length: 6 }, (_, index) => {
      const date = new Date()
      date.setMonth(date.getMonth() - (5 - index))

      return {
        name: date.toLocaleDateString('th-TH', { month: 'short' }),
        amount: monthlyTotal,
      }
    })
  }, [monthlyTotal])

  const dateLabel = useMemo(
    () =>
      new Date().toLocaleDateString('th-TH', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }),
    []
  )

  return (
    <div className="flex h-full flex-col">
      <div className="sticky top-0 z-20 bg-background/92 px-6 pb-6 backdrop-blur-xl header-safe-top">
        <div className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <p className="text-[11px] font-medium tracking-[0.08em] text-muted-foreground">{dateLabel}</p>

            <motion.button
              whileTap={{ scale: 0.9 }}
              aria-label="ดูสรุปภาพรวม"
              className="flex h-11 w-11 items-center justify-center rounded-[1.05rem] border border-white/[0.07] bg-white/[0.04] text-primary shadow-[0_18px_34px_-26px_rgba(0,0,0,1)]"
            >
              <ChartNoAxesColumn size={17} />
            </motion.button>
          </div>

          <div className="space-y-3">
            <h1 className="max-w-[16rem] text-pretty text-[2.8rem] font-black leading-[0.88] tracking-[-0.065em] text-foreground">
              ภาพรวม
              <br />
              <span className="text-primary">
                {completedToday.length}/{totalToday || 0} งาน
              </span>
            </h1>

            <div className="rounded-[1.6rem] border border-white/[0.07] bg-card p-5 shadow-[0_24px_44px_-28px_rgba(0,0,0,1)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-medium tracking-[0.14em] text-primary/80 uppercase">
                    Completion rate
                  </p>
                  <p className="mt-2 numeric-tabular text-[2.3rem] font-black leading-none tracking-[-0.055em] text-foreground">
                    {completionRate}%
                  </p>
                </div>
                <div className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[11px] font-semibold text-primary">
                  วันนี้เสร็จ {completedToday.length} งาน
                </div>
              </div>

              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completionRate}%` }}
                  transition={{ type: 'spring', stiffness: 180, damping: 24 }}
                  className="h-full rounded-full bg-primary"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pt-2 pb-4 no-scrollbar safe-bottom">
        <div className="space-y-8">
          <section className="grid grid-cols-2 gap-3.5">
            <MetricTile
              icon={CheckCircle2}
              label="งานวันนี้"
              value={`${completedToday.length}/${totalToday || 0}`}
              note="งานที่ปิดได้แล้ววันนี้"
              iconBg="bg-emerald-500/15"
              iconColor="text-emerald-400"
              index={0}
            />
            <MetricTile
              icon={AlertCircle}
              label="เกินกำหนด"
              value={overdue.length}
              note={overdue.length > 0 ? 'มีงานที่ควรเคลียร์ก่อน' : 'ไม่มีงานค้างเกินเวลา'}
              iconBg="bg-amber-500/15"
              iconColor="text-amber-400"
              index={1}
            />
            <MetricTile
              icon={CreditCard}
              label="ค่า Sub/เดือน"
              value={formatCurrency(monthlyTotal)}
              note={`${activeSubs.length} รายการที่ยัง active`}
              iconBg="bg-primary/15"
              iconColor="text-primary"
              index={2}
            />
            <MetricTile
              icon={TrendingUp}
              label="ค่า Sub/ปี"
              value={formatCurrency(monthlyTotal * 12)}
              note="ประเมินจากรายการที่ใช้อยู่ตอนนี้"
              iconBg="bg-yellow-500/15"
              iconColor="text-yellow-400"
              index={3}
            />
          </section>

          {upcomingSubs.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-[11px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
                    Upcoming billing
                  </p>
                  <h2 className="mt-1 text-[1.05rem] font-semibold tracking-[-0.03em] text-foreground">
                    จ่ายเร็ว ๆ นี้
                  </h2>
                </div>
                <span className="text-[12px] font-semibold text-primary numeric-tabular">
                  {upcomingSubs.length} รายการ
                </span>
              </div>

              <div className="space-y-4">
                {upcomingSubs.map((sub, index) => (
                  <DueRow key={sub.id} sub={sub} index={index} />
                ))}
              </div>
            </section>
          )}

          {monthlyTotal > 0 && (
            <section className="space-y-4">
              <div>
                <p className="text-[11px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
                  Spend rhythm
                </p>
                <h2 className="mt-1 text-[1.05rem] font-semibold tracking-[-0.03em] text-foreground">
                  ค่าใช้จ่าย 6 เดือน
                </h2>
              </div>

              <div className="rounded-[1.7rem] border border-white/[0.07] bg-card p-4 shadow-[0_22px_42px_-28px_rgba(0,0,0,1)]">
                <ResponsiveContainer width="100%" height={176}>
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
                        borderRadius: '14px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="amount" radius={[7, 7, 0, 0]} fill="var(--color-primary)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}

          {overdue.length > 0 && (
            <section className="space-y-4">
              <div>
                <p className="text-[11px] font-medium tracking-[0.16em] text-red-300/80 uppercase">
                  Needs attention
                </p>
                <h2 className="mt-1 text-[1.05rem] font-semibold tracking-[-0.03em] text-red-300">
                  งานเกินกำหนด
                </h2>
              </div>

              <div className="space-y-3">
                {overdue.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-[1.45rem] border border-red-900/55 bg-card p-4 shadow-[0_20px_40px_-28px_rgba(0,0,0,1)]"
                  >
                    <p className="text-sm font-semibold tracking-[-0.02em] text-foreground">{task.title}</p>
                    <p className="mt-2 text-xs text-red-300">
                      ครบกำหนด{' '}
                      {new Date(task.dueDate).toLocaleDateString('th-TH', {
                        day: 'numeric',
                        month: 'short',
                      })}
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
