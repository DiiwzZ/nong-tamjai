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
      className="bg-card border border-border rounded-2xl p-4 shadow-[0_10px_24px_-16px_rgba(0,0,0,0.85)]"
    >
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-4', color)}>
        <Icon size={18} className="text-white" />
      </div>
      <p className="text-[2rem] font-black text-foreground tracking-[-0.04em] leading-none">{value}</p>
      <p className="text-[11px] font-semibold text-muted-foreground mt-1.5">{label}</p>
      {sub && <p className="text-[11px] text-muted-foreground mt-0.5">{sub}</p>}
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
    <div className="flex flex-col h-full">
      <div className="px-5 pb-3 bg-background sticky top-0 z-20 header-safe-top">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-0.5">
              {new Date().toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <h1 className="text-[2.2rem] font-black text-foreground leading-[0.98] tracking-[-0.04em]">
              ภาพรวม<br />
              <span className="text-primary">
                {completedToday.length}/{activeTasks.length + completedToday.length} งาน
              </span>
            </h1>
          </div>
          <motion.button
            whileTap={{ scale: 0.85 }}
            className="w-9 h-9 rounded-2xl mt-1 flex items-center justify-center bg-muted text-primary"
          >
            <ChartNoAxesColumn size={17} />
          </motion.button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pt-2 pb-6 safe-bottom">
        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatCard
            icon={CheckCircle2}
            label="งานวันนี้"
            value={`${completedToday.length}/${activeTasks.length + completedToday.length}`}
            color="bg-emerald-500"
            index={0}
          />
          <StatCard
            icon={AlertCircle}
            label="เกินกำหนด"
            value={overdue.length}
            sub={overdue.length > 0 ? 'ต้องรีบจัดการ' : 'ดีมาก!'}
            color={overdue.length > 0 ? 'bg-destructive' : 'bg-primary'}
            index={1}
          />
          <StatCard
            icon={CreditCard}
            label="ค่า Sub/เดือน"
            value={formatCurrency(monthlyTotal)}
            sub={`${activeSubs.length} รายการ`}
            color="bg-primary"
            index={2}
          />
          <StatCard
            icon={TrendingUp}
            label="ค่า Sub/ปี"
            value={formatCurrency(monthlyTotal * 12)}
            color="bg-amber-500"
            index={3}
          />
        </div>

        {upcomingSubs.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[15px] font-black tracking-[-0.02em] text-foreground">จ่ายเร็วๆ นี้</h2>
              <span className="text-[12px] font-bold text-primary">ดูทั้งหมด</span>
            </div>
            <div className="flex flex-col gap-2">
              {upcomingSubs.map((sub) => (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    'flex items-center gap-3 p-3.5 rounded-2xl border',
                    sub.days <= 3 ? 'bg-red-950/20 border-red-900/60' : 'bg-card border-border'
                  )}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: sub.color || '#6b7280' }}
                  >
                    {sub.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{sub.name}</p>
                    <p className={cn('text-xs', sub.days <= 3 ? 'text-destructive' : 'text-muted-foreground')}>
                      {sub.days === 0 ? 'วันนี้!' : sub.days === 1 ? 'พรุ่งนี้' : `อีก ${sub.days} วัน`}
                    </p>
                  </div>
                  <p className="text-[15px] font-black tracking-[-0.02em] text-foreground">{formatCurrency(sub.amount)}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {monthlyTotal > 0 && (
          <div className="mb-6">
            <h2 className="text-[15px] font-black tracking-[-0.02em] text-foreground mb-3">ค่าใช้จ่าย 6 เดือน</h2>
            <div className="bg-card border border-border rounded-2xl p-4">
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={chartData} barSize={20}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--color-muted-foreground)' }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip
                    formatter={(value) => [formatCurrency(value), 'ค่าใช้จ่าย']}
                    contentStyle={{
                      backgroundColor: 'var(--color-card)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="amount" radius={[6, 6, 0, 0]} fill="var(--color-primary)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {overdue.length > 0 && (
          <div>
            <h2 className="text-[15px] font-black tracking-[-0.02em] text-destructive mb-3">งานเกินกำหนด</h2>
            {overdue.map((task) => (
              <div key={task.id} className="bg-red-950/20 border border-red-900/60 rounded-2xl p-3 mb-2">
                <p className="text-sm font-medium text-foreground">{task.title}</p>
                <p className="text-xs text-destructive mt-0.5">
                  {new Date(task.dueDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
