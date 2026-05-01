import { useMemo } from 'react'
import { motion } from 'motion/react'
import { CheckCircle2, AlertCircle, CreditCard, TrendingUp } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { cn, formatCurrency, daysUntil } from '@/lib/utils'
import { useStore } from '@/store/useStore'
import { Header } from '@/components/layout/Header'

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center mb-3', color)}>
        <Icon size={18} className="text-white" />
      </div>
      <p className="text-xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
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
    <div className="flex flex-col h-full overflow-y-auto no-scrollbar">
      <Header title="ภาพรวม" />
      <div className="px-5 pb-2">
        <p className="text-sm text-muted-foreground -mt-2 mb-2">
          {new Date().toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      <div className="px-5 pb-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <StatCard
            icon={CheckCircle2}
            label="Task วันนี้"
            value={`${completedToday.length}/${activeTasks.length + completedToday.length}`}
            color="bg-green-500"
          />
          <StatCard
            icon={AlertCircle}
            label="เกินกำหนด"
            value={overdue.length}
            sub={overdue.length > 0 ? 'ต้องรีบจัดการ' : 'ดีมาก!'}
            color={overdue.length > 0 ? 'bg-destructive' : 'bg-blue-500'}
          />
          <StatCard
            icon={CreditCard}
            label="ค่า Sub/เดือน"
            value={formatCurrency(monthlyTotal)}
            sub={`${activeSubs.length} รายการ`}
            color="bg-purple-500"
          />
          <StatCard
            icon={TrendingUp}
            label="ค่า Sub/ปี"
            value={formatCurrency(monthlyTotal * 12)}
            color="bg-orange-500"
          />
        </div>

        {/* Upcoming payments */}
        {upcomingSubs.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-foreground mb-3">จ่ายเร็วๆ นี้</h2>
            <div className="flex flex-col gap-2">
              {upcomingSubs.map((sub) => (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-xl border',
                    sub.days <= 3 ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900' : 'bg-card border-border'
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
                  <p className="text-sm font-bold text-foreground">{formatCurrency(sub.amount)}</p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Monthly chart */}
        {monthlyTotal > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-foreground mb-3">ค่าใช้จ่าย 6 เดือน</h2>
            <div className="bg-card border border-border rounded-xl p-4">
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

        {/* Overdue tasks */}
        {overdue.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-destructive mb-3">Task เกินกำหนด</h2>
            {overdue.map((task) => (
              <div key={task.id} className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl p-3 mb-2">
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
