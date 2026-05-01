import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, CreditCard, List, CalendarDays } from 'lucide-react'
import { Sheet } from '@/components/ui/Sheet'
import { Input } from '@/components/ui/Input'
import { CalendarView } from '@/components/subscriptions/CalendarView'
import { QuickAddFAB } from '@/components/ui/QuickAdd'
import { Button } from '@/components/ui/Button'
import { cn, formatCurrency, daysUntil } from '@/lib/utils'
import { useStore } from '@/store/useStore'
import { SubSkeleton } from '@/components/ui/Skeleton'

const STATUS_LABELS = {
  active: { label: 'Active', color: 'text-emerald-400 bg-emerald-400/15' },
  paused: { label: 'Paused', color: 'text-amber-400 bg-amber-400/15' },
  trial: { label: 'Trial', color: 'text-primary bg-primary/15' },
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
        'cursor-pointer select-none rounded-[1.65rem] border p-[18px] shadow-[0_18px_38px_-26px_rgba(0,0,0,0.95)] transition-colors duration-150',
        isUrgent ? 'border-red-900/60 bg-red-950/20' : 'border-white/6 bg-card/92'
      )}
    >
      <div className="flex items-center gap-3.5">
        <div
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[1rem] text-base font-bold text-white"
          style={{ backgroundColor: sub.color || '#6b7280' }}
        >
          {sub.name?.[0]?.toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold text-foreground">{sub.name}</p>
            <span className={cn('flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold', status.color)}>
              {status.label}
            </span>
          </div>

          <div className="mt-1 flex items-center gap-2">
            {sub.paymentMethod && <span className="text-xs text-muted-foreground">{sub.paymentMethod}</span>}
            {sub.nextBillingDate && days !== null && (
              <span className={cn('text-xs font-medium', isUrgent ? 'text-red-400' : 'text-muted-foreground')}>
                {days === 0 ? 'จ่ายวันนี้' : days === 1 ? 'จ่ายพรุ่งนี้' : `อีก ${days} วัน`}
              </span>
            )}
          </div>
        </div>

        <div className="flex-shrink-0 text-right">
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

  const createInitialForm = (currentSub) => ({
    name: currentSub?.name || '',
    amount: currentSub?.amount || '',
    billingCycle: currentSub?.billingCycle || 'monthly',
    nextBillingDate: currentSub?.nextBillingDate?.slice(0, 10) || '',
    paymentMethod: currentSub?.paymentMethod || 'เดบิต',
    status: currentSub?.status || 'active',
    alertDays: currentSub?.alertDays || 3,
    color: currentSub?.color || '#6b7280',
    note: currentSub?.note || '',
  })

  const [form, setForm] = useState(createInitialForm(sub))

  useEffect(() => {
    if (open) setForm(createInitialForm(sub))
  }, [open, sub])

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
      <div className="flex flex-col gap-4 px-5 py-4 pb-8">
        {!isEdit && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">บริการยอดนิยม</label>
            <div className="flex flex-wrap gap-2">
              {POPULAR_SUBS.map((item) => (
                <button
                  key={item.name}
                  onClick={() => selectPopular(item)}
                  className={cn(
                    'rounded-xl px-3 py-1.5 text-xs font-medium text-white transition-all',
                    form.name === item.name ? 'scale-105 ring-2 ring-white/50' : 'opacity-80'
                  )}
                  style={{ backgroundColor: item.color }}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <Input label="ชื่อ" placeholder="ชื่อ subscription..." value={form.name} onChange={(e) => set('name', e.target.value)} />

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
                  'flex-1 rounded-xl border py-2 text-xs font-medium transition-all',
                  form.billingCycle === b.id ? 'border-primary bg-primary text-white' : 'border-transparent bg-muted text-muted-foreground'
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
          <div className="flex flex-wrap gap-2">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m}
                onClick={() => set('paymentMethod', m)}
                className={cn(
                  'rounded-xl border px-3 py-1.5 text-xs font-medium transition-all',
                  form.paymentMethod === m ? 'border-primary bg-primary text-white' : 'border-transparent bg-muted text-muted-foreground'
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-foreground">สถานะ</label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(STATUS_LABELS).map(([key, val]) => (
              <button
                key={key}
                onClick={() => set('status', key)}
                className={cn(
                  'rounded-xl border px-3 py-1.5 text-xs font-medium transition-all',
                  form.status === key ? 'border-primary bg-primary text-white' : 'border-transparent bg-muted text-muted-foreground'
                )}
              >
                {val.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-foreground">แจ้งเตือนล่วงหน้า: {form.alertDays} วัน</label>
          <input
            type="range"
            min="1"
            max="14"
            value={form.alertDays}
            onChange={(e) => set('alertDays', parseInt(e.target.value))}
            className="accent-primary"
          />
        </div>

        <Button onClick={handleSubmit} className="mt-2 w-full">
          {isEdit ? 'บันทึก' : 'เพิ่ม Subscription'}
        </Button>
      </div>
    </Sheet>
  )
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center gap-4 py-20 text-center"
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-[1.7rem] bg-primary/10">
        <CreditCard size={36} className="text-primary" />
      </div>
      <div className="space-y-1.5">
        <p className="font-semibold text-foreground">ยังไม่มีรายจ่ายประจำตอนนี้</p>
        <p className="text-sm text-muted-foreground">กด + เพื่อให้น้องช่วยเตือนรายการแรก</p>
      </div>
    </motion.div>
  )
}

export function Subscriptions() {
  const { subscriptions } = useStore()
  const [formOpen, setFormOpen] = useState(false)
  const [editSub, setEditSub] = useState(null)
  const [view, setView] = useState('list')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400)
    return () => clearTimeout(t)
  }, [])

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
    <div className="flex h-full flex-col">
      <div className="sticky top-0 z-20 bg-background/92 px-6 pb-5 backdrop-blur-xl header-safe-top">
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-medium text-muted-foreground">
              {new Date().toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>

            <div className="flex items-center gap-2">
              {subscriptions.length > 0 && (
                <div className="flex items-center gap-1 rounded-[1rem] border border-white/6 bg-muted/52 p-1">
                  <button
                    onClick={() => setView('list')}
                    aria-label="มุมมองรายการ"
                    className={cn(
                      'rounded-[0.9rem] p-1.5 transition-colors',
                      view === 'list' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                    )}
                  >
                    <List size={16} />
                  </button>
                  <button
                    onClick={() => setView('calendar')}
                    aria-label="มุมมองปฏิทิน"
                    className={cn(
                      'rounded-[0.9rem] p-1.5 transition-colors',
                      view === 'calendar' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                    )}
                  >
                    <CalendarDays size={16} />
                  </button>
                </div>
              )}

              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => {
                  setEditSub(null)
                  setFormOpen(true)
                }}
                aria-label="เพิ่ม subscription"
                className="flex h-10 w-10 items-center justify-center rounded-[1rem] border border-primary bg-primary text-white"
              >
                <Plus size={18} />
              </motion.button>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/78">
              recurring spend
            </p>
            <h1 className="max-w-[16rem] text-balance text-[2.45rem] font-black leading-[0.9] tracking-[-0.055em] text-foreground">
              {active.length > 0 ? (
                <>
                  จ่าย <span className="text-primary">{formatCurrency(monthly)}</span>
                  <br />
                  ต่อเดือน
                </>
              ) : (
                <>
                  น้องเตือน
                  <br />
                  ยังไม่มีรายจ่าย
                </>
              )}
            </h1>
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
              <span className="numeric-tabular rounded-full border border-white/6 bg-muted/52 px-3 py-1.5 font-medium">
                รายปี {formatCurrency(monthly * 12)}
              </span>
              <span className="numeric-tabular rounded-full border border-white/6 bg-muted/52 px-3 py-1.5 font-medium">
                {active.length} รายการ
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pt-3 no-scrollbar safe-bottom">
        {loading ? (
          <>
            {[0, 1, 2].map((i) => (
              <SubSkeleton key={i} />
            ))}
          </>
        ) : subscriptions.length === 0 ? (
          <div className="flex min-h-full items-center justify-center pb-20">
            <EmptyState />
          </div>
        ) : view === 'calendar' ? (
          <div className="pb-3">
            <CalendarView subscriptions={subscriptions} />
          </div>
        ) : (
          <div className="space-y-5 pb-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[14px] font-black tracking-[-0.02em] text-foreground">รายการทั้งหมด</h2>
              <span className="text-[12px] font-bold text-primary">จัดการ</span>
            </div>

            <div className="space-y-4">
              <AnimatePresence>
                {subscriptions.map((sub, i) => (
                  <SubCard key={sub.id} sub={sub} onTap={handleTap} index={i} />
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>

      <QuickAddFAB onSelect={openNew} />

      <SubForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditSub(null)
        }}
        sub={editSub}
      />
    </div>
  )
}
