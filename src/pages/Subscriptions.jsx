import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, CreditCard, X, List, CalendarDays } from 'lucide-react'
import { Sheet } from '@/components/ui/Sheet'
import { Input } from '@/components/ui/Input'
import { Header } from '@/components/layout/Header'
import { CalendarView } from '@/components/subscriptions/CalendarView'
import { QuickAddFAB } from '@/components/ui/QuickAdd'
import { Button } from '@/components/ui/Button'
import { cn, formatCurrency, daysUntil } from '@/lib/utils'
import { useStore } from '@/store/useStore'
import { SubSkeleton } from '@/components/ui/Skeleton'

const STATUS_LABELS = {
  active:    { label: 'Active',  color: 'text-emerald-400 bg-emerald-400/15' },
  paused:    { label: 'Paused',  color: 'text-amber-400 bg-amber-400/15' },
  trial:     { label: 'Trial',   color: 'text-primary bg-primary/15' },
  cancelled: { label: 'ยกเลิก', color: 'text-muted-foreground bg-muted' },
}

const BILLING_CYCLES = [
  { id: 'monthly', label: 'รายเดือน' },
  { id: 'yearly', label: 'รายปี' },
  { id: 'manual', label: 'กดจ่ายเอง' },
]

const PAYMENT_METHODS = ['เดบิต', 'เครดิต', 'PromptPay', 'อื่นๆ']

const POPULAR_SUBS = [
  { name: 'Netflix', color: '#E50914' },
  { name: 'Spotify', color: '#1DB954' },
  { name: 'YouTube Premium', color: '#FF0000' },
  { name: 'iCloud', color: '#3b82f6' },
  { name: 'ChatGPT', color: '#10a37f' },
  { name: 'Adobe', color: '#FF0000' },
]

function SubCard({ sub, onTap, index = 0 }) {
  const days = daysUntil(sub.nextBillingDate)
  const status = STATUS_LABELS[sub.status] || STATUS_LABELS.active
  const isUrgent = days !== null && days <= 3 && sub.status === 'active'
  const monthlyAmount = sub.billingCycle === 'yearly' ? sub.amount / 12 : sub.amount

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      whileTap={{ scale: 0.985 }}
      onClick={() => onTap(sub)}
      className={cn(
        'rounded-2xl p-4 mb-4 cursor-pointer select-none shadow-[0_10px_24px_-16px_rgba(0,0,0,0.85)]',
        'border transition-colors duration-150',
        isUrgent
          ? 'bg-red-950/20 border-red-900/60'
          : 'bg-card border-border'
      )}
    >
      <div className="flex items-center gap-3">
        {/* logo avatar */}
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center text-white text-base font-bold flex-shrink-0"
          style={{ backgroundColor: sub.color || '#6b7280' }}
        >
          {sub.name?.[0]?.toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-foreground truncate">{sub.name}</p>
            <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0', status.color)}>
              {status.label}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            {sub.paymentMethod && (
              <span className="text-xs text-muted-foreground">{sub.paymentMethod}</span>
            )}
            {sub.nextBillingDate && days !== null && (
              <span className={cn('text-xs font-medium', isUrgent ? 'text-red-400' : 'text-muted-foreground')}>
                {days === 0 ? 'จ่ายวันนี้' : days === 1 ? 'จ่ายพรุ่งนี้' : `อีก ${days} วัน`}
              </span>
            )}
          </div>
        </div>

        <div className="text-right flex-shrink-0">
          <p className="text-[15px] font-black tracking-[-0.02em] text-foreground">{formatCurrency(sub.amount)}</p>
          {sub.billingCycle === 'yearly' && (
            <p className="text-[10px] text-muted-foreground">{formatCurrency(monthlyAmount)}/เดือน</p>
          )}
          <p className="text-[10px] text-muted-foreground">
            {BILLING_CYCLES.find((b) => b.id === sub.billingCycle)?.label}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

function SubForm({ open, onClose, sub }) {
  const { addSubscription, updateSubscription } = useStore()
  const isEdit = !!sub

  const [form, setForm] = useState({
    name: sub?.name || '',
    amount: sub?.amount || '',
    billingCycle: sub?.billingCycle || 'monthly',
    nextBillingDate: sub?.nextBillingDate?.slice(0, 10) || '',
    paymentMethod: sub?.paymentMethod || 'เดบิต',
    status: sub?.status || 'active',
    alertDays: sub?.alertDays || 3,
    color: sub?.color || '#6b7280',
    note: sub?.note || '',
  })

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const handleSubmit = () => {
    if (!form.name.trim() || !form.amount) return
    const data = {
      ...form,
      amount: parseFloat(form.amount),
      nextBillingDate: form.nextBillingDate ? new Date(form.nextBillingDate).toISOString() : null,
    }
    if (isEdit) {
      updateSubscription(sub.id, data)
    } else {
      addSubscription(data)
    }
    onClose()
  }

  const selectPopular = (item) => {
    set('name', item.name)
    set('color', item.color)
  }

  return (
    <Sheet open={open} onClose={onClose} title={isEdit ? 'แก้ไข Subscription' : 'Subscription ใหม่'}>
      <div className="px-5 py-4 flex flex-col gap-4 pb-8">
        {!isEdit && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">บริการยอดนิยม</label>
            <div className="flex gap-2 flex-wrap">
              {POPULAR_SUBS.map((item) => (
                <button
                  key={item.name}
                  onClick={() => selectPopular(item)}
                  className={cn(
                    'px-3 py-1.5 rounded-xl text-xs font-medium text-white transition-all',
                    form.name === item.name ? 'ring-2 ring-white/50 scale-105' : 'opacity-80'
                  )}
                  style={{ backgroundColor: item.color }}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <Input
          label="ชื่อ"
          placeholder="ชื่อ subscription..."
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
        />

        <Input
          label="ราคา (บาท)"
          type="number"
          placeholder="0"
          value={form.amount}
          onChange={(e) => set('amount', e.target.value)}
          inputMode="decimal"
        />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-foreground">รอบจ่าย</label>
          <div className="flex gap-2">
            {BILLING_CYCLES.map((b) => (
              <button
                key={b.id}
                onClick={() => set('billingCycle', b.id)}
                className={cn(
                  'flex-1 py-2 rounded-xl text-xs font-medium border transition-all',
                  form.billingCycle === b.id
                    ? 'bg-primary text-white border-primary'
                    : 'bg-muted text-muted-foreground border-transparent'
                )}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="วันจ่ายครั้งถัดไป"
          type="date"
          value={form.nextBillingDate}
          onChange={(e) => set('nextBillingDate', e.target.value)}
        />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-foreground">ช่องทางชำระเงิน</label>
          <div className="flex gap-2 flex-wrap">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m}
                onClick={() => set('paymentMethod', m)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-medium border transition-all',
                  form.paymentMethod === m
                    ? 'bg-primary text-white border-primary'
                    : 'bg-muted text-muted-foreground border-transparent'
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-foreground">สถานะ</label>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(STATUS_LABELS).map(([key, val]) => (
              <button
                key={key}
                onClick={() => set('status', key)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-medium border transition-all',
                  form.status === key
                    ? 'bg-primary text-white border-primary'
                    : 'bg-muted text-muted-foreground border-transparent'
                )}
              >
                {val.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-foreground">
            แจ้งเตือนล่วงหน้า: {form.alertDays} วัน
          </label>
          <input
            type="range"
            min="1"
            max="14"
            value={form.alertDays}
            onChange={(e) => set('alertDays', parseInt(e.target.value))}
            className="accent-primary"
          />
        </div>

        <Button onClick={handleSubmit} className="w-full mt-2">
          {isEdit ? 'บันทึก' : 'เพิ่ม Subscription'}
        </Button>
      </div>
    </Sheet>
  )
}

export function Subscriptions() {
  const { subscriptions } = useStore()
  const [formOpen, setFormOpen] = useState(false)
  const [editSub, setEditSub] = useState(null)
  const [view, setView] = useState('list')
  const [loading, setLoading] = useState(true)
  useEffect(() => { const t = setTimeout(() => setLoading(false), 400); return () => clearTimeout(t) }, [])

  const active = subscriptions.filter((s) => s.status !== 'cancelled')
  const monthly = active.reduce((sum, s) => {
    if (s.billingCycle === 'yearly') return sum + s.amount / 12
    if (s.billingCycle === 'monthly') return sum + s.amount
    return sum
  }, 0)

  const handleTap = (sub) => {
    setEditSub(sub)
    setFormOpen(true)
  }

  const openNew = () => {
    setEditSub(null)
    setFormOpen(true)
  }

  return (
    <div className="flex flex-col h-full">
      {/* ── Header editorial ── */}
      <div className="px-6 pb-6 bg-background sticky top-0 z-20 header-safe-top">
        <div className="flex items-start justify-between mb-4">
          <p className="text-xs font-medium text-muted-foreground pt-1.5">
            {new Date().toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <div className="flex items-center gap-1.5">
            {subscriptions.length > 0 && (
              <div className="flex gap-1 bg-muted rounded-xl p-1">
                <button
                  onClick={() => setView('list')}
                  className={cn('p-1.5 rounded-lg transition-colors', view === 'list' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground')}
                >
                  <List size={16} />
                </button>
                <button
                  onClick={() => setView('calendar')}
                  className={cn('p-1.5 rounded-lg transition-colors', view === 'calendar' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground')}
                >
                  <CalendarDays size={16} />
                </button>
              </div>
            )}
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => { setEditSub(null); setFormOpen(true) }}
              className="w-9 h-9 rounded-xl flex items-center justify-center bg-primary text-white"
            >
              <Plus size={18} />
            </motion.button>
          </div>
        </div>

        <div className="max-w-[14rem]">
          <h1 className="text-[2rem] font-black text-foreground leading-[1.02] tracking-[-0.04em] text-balance">
            {active.length > 0
              ? <>จ่าย <span className="text-primary">{formatCurrency(monthly)}</span><br/>ต่อเดือน</>
              : <>น้องเตือน<br/><span className="text-muted-foreground text-xl inline-block mt-1.5">ยังไม่มีรายจ่าย</span></>
            }
          </h1>
        </div>
      </div>

      {/* ── Summary stats row ── */}
      {active.length > 0 && (
        <div className="px-6 pt-5 pb-3">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="flex gap-3.5"
          >
            <div className="flex-1 bg-card border border-border rounded-2xl p-3.5">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">รายปี</p>
              <p className="text-[15px] font-black text-foreground tracking-[-0.02em]">{formatCurrency(monthly * 12)}</p>
            </div>
            <div className="flex-1 bg-card border border-border rounded-2xl p-3.5">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">รายการ</p>
              <p className="text-[15px] font-black text-foreground tracking-[-0.02em]">{active.length} รายการ</p>
            </div>
          </motion.div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto no-scrollbar px-6 pt-5 safe-bottom">
        {loading ? (
          <>{[0,1,2].map((i) => <SubSkeleton key={i} />)}</>
        ) : subscriptions.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center gap-4 py-20 text-center"
          >
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
              <CreditCard size={36} className="text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">ยังไม่มีรายจ่ายเลย น้องโล่งใจแทน</p>
              <p className="text-sm text-muted-foreground mt-1">กด + ให้น้องช่วยติดตามค่าใช้จ่าย</p>
            </div>
          </motion.div>
        ) : view === 'calendar' ? (
          <CalendarView subscriptions={subscriptions} />
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-black tracking-[-0.02em] text-foreground">รายการทั้งหมด</h2>
              <span className="text-[12px] font-bold text-primary">จัดการ</span>
            </div>
            <AnimatePresence>
              {subscriptions.map((sub, i) => (
                <SubCard key={sub.id} sub={sub} onTap={handleTap} index={i} />
              ))}
            </AnimatePresence>
          </>
        )}
      </div>

      <QuickAddFAB onSelect={openNew} />

      <SubForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditSub(null) }}
        sub={editSub}
      />
    </div>
  )
}
