import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { CalendarDays, CreditCard, List, Plus, Sparkles } from 'lucide-react'
import { CalendarView } from '@/components/subscriptions/CalendarView'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Sheet } from '@/components/ui/Sheet'
import { SubSkeleton } from '@/components/ui/Skeleton'
import { cn, daysUntil, formatCurrency } from '@/lib/utils'
import { useStore } from '@/store/useStore'

const STATUS_LABELS = {
  active: { label: 'Active', color: 'text-emerald-300 bg-emerald-400/12 border-emerald-400/16' },
  paused: { label: 'Paused', color: 'text-amber-300 bg-amber-400/12 border-amber-400/16' },
  trial: { label: 'Trial', color: 'text-primary bg-primary/12 border-primary/16' },
  cancelled: { label: 'ยกเลิก', color: 'text-muted-foreground bg-white/[0.04] border-white/8' },
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
  { name: 'iCloud', color: '#3B82F6' },
  { name: 'ChatGPT', color: '#10A37F' },
  { name: 'Adobe', color: '#FF0000' },
]

function SummaryPanel({ label, value, note, tone = 'default' }) {
  const toneClass = {
    default: 'border-white/8 bg-white/[0.04]',
    primary: 'border-primary/18 bg-primary/10',
  }

  return (
    <div className={cn('rounded-[1.35rem] border p-4 shadow-[0_22px_40px_-28px_rgba(0,0,0,1)]', toneClass[tone])}>
      <p className="text-[11px] font-medium tracking-[0.12em] text-muted-foreground uppercase">{label}</p>
      <p className={cn('mt-2 numeric-tabular text-[1.45rem] font-black leading-none tracking-[-0.045em]', tone === 'primary' ? 'text-primary' : 'text-foreground')}>
        {value}
      </p>
      {note && <p className="mt-2 text-xs text-muted-foreground">{note}</p>}
    </div>
  )
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center gap-4 py-20 text-center"
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-[1.8rem] border border-white/8 bg-white/[0.04] shadow-[0_22px_40px_-28px_rgba(0,0,0,1)]">
        <CreditCard size={34} className="text-primary" />
      </div>
      <div className="space-y-2">
        <p className="text-lg font-semibold tracking-[-0.03em] text-foreground">ยังไม่มีรายจ่ายประจำ</p>
        <p className="max-w-[18rem] text-sm leading-6 text-muted-foreground">
          เพิ่มรายการแรกไว้ก่อน เดี๋ยวน้องจะช่วยเตือนให้ตามรอบที่ตั้งไว้
        </p>
      </div>
    </motion.div>
  )
}

function SubCard({ sub, onTap, index = 0 }) {
  const days = daysUntil(sub.nextBillingDate)
  const status = STATUS_LABELS[sub.status] || STATUS_LABELS.active
  const isUrgent = days !== null && days <= 3 && sub.status === 'active'
  const monthlyAmount = sub.billingCycle === 'yearly' ? sub.amount / 12 : sub.amount

  const dueLabel = (() => {
    if (days === null) return 'ยังไม่มีรอบถัดไป'
    if (days === 0) return 'จ่ายวันนี้'
    if (days === 1) return 'จ่ายพรุ่งนี้'
    return `อีก ${days} วัน`
  })()

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      whileTap={{ scale: 0.985 }}
      onClick={() => onTap(sub)}
      className={cn(
        'w-full rounded-[1.7rem] border p-[18px] text-left shadow-[0_22px_42px_-28px_rgba(0,0,0,1)] transition-all',
        isUrgent
          ? 'border-red-900/55 bg-[linear-gradient(180deg,rgba(64,22,30,0.86),rgba(34,18,22,0.92))]'
          : 'border-white/8 bg-[linear-gradient(180deg,rgba(32,35,52,0.92),rgba(21,24,36,0.96))]'
      )}
    >
      <div className="flex items-start gap-4">
        <div
          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[1rem] text-base font-bold text-white shadow-[0_12px_24px_-16px_rgba(0,0,0,1)]"
          style={{ backgroundColor: sub.color || '#6B7280' }}
        >
          {sub.name?.[0]?.toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-[15px] font-semibold tracking-[-0.02em] text-foreground">{sub.name}</p>
                <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-semibold', status.color)}>
                  {status.label}
                </span>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                {sub.paymentMethod && <span>{sub.paymentMethod}</span>}
                <span className="h-1 w-1 rounded-full bg-white/18" />
                <span className={cn('font-medium', isUrgent ? 'text-red-300' : 'text-muted-foreground')}>
                  {dueLabel}
                </span>
              </div>
            </div>

            <div className="text-right">
              <p className="numeric-tabular text-[1rem] font-black tracking-[-0.04em] text-foreground">
                {formatCurrency(sub.amount)}
              </p>
              <p className="mt-1 text-[10px] text-muted-foreground">
                {BILLING_CYCLES.find((cycle) => cycle.id === sub.billingCycle)?.label}
              </p>
            </div>
          </div>

          {sub.billingCycle === 'yearly' && (
            <div className="mt-3 inline-flex rounded-full border border-white/8 bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
              เฉลี่ย {formatCurrency(monthlyAmount)}/เดือน
            </div>
          )}
        </div>
      </div>
    </motion.button>
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
    color: currentSub?.color || '#6B7280',
    note: currentSub?.note || '',
  })

  const [form, setForm] = useState(createInitialForm(sub))

  useEffect(() => {
    if (open) {
      setForm(createInitialForm(sub))
    }
  }, [open, sub])

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }))

  const handleSubmit = () => {
    if (!form.name.trim() || !form.amount) return

    const payload = {
      ...form,
      amount: parseFloat(form.amount),
      nextBillingDate: form.nextBillingDate ? new Date(form.nextBillingDate).toISOString() : null,
    }

    if (isEdit) {
      updateSubscription(sub.id, payload)
    } else {
      addSubscription(payload)
    }

    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} title={isEdit ? 'แก้ไข subscription' : 'เพิ่ม subscription'}>
      <div className="flex flex-col gap-4 px-5 py-4 pb-8">
        {!isEdit && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">บริการยอดนิยม</label>
            <div className="flex flex-wrap gap-2">
              {POPULAR_SUBS.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    setField('name', item.name)
                    setField('color', item.color)
                  }}
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

        <Input
          label="ชื่อ"
          placeholder="เช่น Netflix หรือ Adobe"
          value={form.name}
          onChange={(event) => setField('name', event.target.value)}
        />

        <Input
          label="ราคา (บาท)"
          type="number"
          placeholder="0"
          value={form.amount}
          onChange={(event) => setField('amount', event.target.value)}
          inputMode="decimal"
        />

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">รอบจ่าย</label>
          <div className="grid grid-cols-3 gap-2">
            {BILLING_CYCLES.map((cycle) => (
              <button
                key={cycle.id}
                onClick={() => setField('billingCycle', cycle.id)}
                className={cn(
                  'rounded-xl border py-2 text-xs font-medium transition-all',
                  form.billingCycle === cycle.id
                    ? 'border-primary bg-primary text-white'
                    : 'border-transparent bg-muted text-muted-foreground'
                )}
              >
                {cycle.label}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="วันจ่ายครั้งถัดไป"
          type="date"
          value={form.nextBillingDate}
          onChange={(event) => setField('nextBillingDate', event.target.value)}
        />

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">ช่องทางชำระเงิน</label>
          <div className="flex flex-wrap gap-2">
            {PAYMENT_METHODS.map((method) => (
              <button
                key={method}
                onClick={() => setField('paymentMethod', method)}
                className={cn(
                  'rounded-xl border px-3 py-1.5 text-xs font-medium transition-all',
                  form.paymentMethod === method
                    ? 'border-primary bg-primary text-white'
                    : 'border-transparent bg-muted text-muted-foreground'
                )}
              >
                {method}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">สถานะ</label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(STATUS_LABELS).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setField('status', key)}
                className={cn(
                  'rounded-xl border px-3 py-1.5 text-xs font-medium transition-all',
                  form.status === key
                    ? 'border-primary bg-primary text-white'
                    : 'border-transparent bg-muted text-muted-foreground'
                )}
              >
                {value.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">แจ้งเตือนล่วงหน้า: {form.alertDays} วัน</label>
          <input
            type="range"
            min="1"
            max="14"
            value={form.alertDays}
            onChange={(event) => setField('alertDays', parseInt(event.target.value, 10))}
            className="accent-primary"
          />
        </div>

        <Button onClick={handleSubmit} className="mt-2 w-full">
          {isEdit ? 'บันทึกการแก้ไข' : 'เพิ่ม subscription'}
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

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400)
    return () => clearTimeout(timer)
  }, [])

  const active = useMemo(
    () => subscriptions.filter((subscription) => subscription.status !== 'cancelled'),
    [subscriptions]
  )

  const monthlyTotal = useMemo(
    () =>
      active.reduce((sum, subscription) => {
        if (subscription.billingCycle === 'yearly') return sum + subscription.amount / 12
        if (subscription.billingCycle === 'monthly') return sum + subscription.amount
        return sum
      }, 0),
    [active]
  )

  const closestDue = useMemo(() => {
    return active
      .filter((subscription) => subscription.nextBillingDate)
      .map((subscription) => ({ ...subscription, days: daysUntil(subscription.nextBillingDate) }))
      .filter((subscription) => subscription.days !== null)
      .sort((a, b) => a.days - b.days)[0]
  }, [active])

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
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-[11px] font-medium tracking-[0.08em] text-muted-foreground">{dateLabel}</p>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/14 bg-primary/8 px-3 py-1 text-[11px] font-semibold tracking-[0.14em] text-primary uppercase">
                <Sparkles size={12} />
                Recurring spend
              </div>
            </div>

            <div className="flex items-center gap-2">
              {subscriptions.length > 0 && (
                <div className="flex items-center gap-1 rounded-[1.15rem] border border-white/8 bg-white/[0.04] p-1.5 shadow-[0_18px_34px_-26px_rgba(0,0,0,1)]">
                  <button
                    onClick={() => setView('list')}
                    aria-label="มุมมองรายการ"
                    className={cn(
                      'rounded-[0.95rem] p-2 transition-all',
                      view === 'list' ? 'bg-primary text-white shadow-[0_16px_28px_-16px_rgba(59,130,246,0.9)]' : 'text-muted-foreground'
                    )}
                  >
                    <List size={16} />
                  </button>
                  <button
                    onClick={() => setView('calendar')}
                    aria-label="มุมมองปฏิทิน"
                    className={cn(
                      'rounded-[0.95rem] p-2 transition-all',
                      view === 'calendar' ? 'bg-primary text-white shadow-[0_16px_28px_-16px_rgba(59,130,246,0.9)]' : 'text-muted-foreground'
                    )}
                  >
                    <CalendarDays size={16} />
                  </button>
                </div>
              )}

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setEditSub(null)
                  setFormOpen(true)
                }}
                aria-label="เพิ่ม subscription"
                className="flex h-11 w-11 items-center justify-center rounded-[1.05rem] border border-primary/28 bg-primary text-white shadow-[0_18px_34px_-20px_rgba(59,130,246,0.9)]"
              >
                <Plus size={18} />
              </motion.button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-3">
              <h1 className="max-w-[16rem] text-pretty text-[2.8rem] font-black leading-[0.88] tracking-[-0.065em] text-foreground">
                {active.length > 0 ? (
                  <>
                    จ่าย <span className="text-primary">{formatCurrency(monthlyTotal)}</span>
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
              <p className="max-w-[19rem] text-sm leading-6 text-muted-foreground">
                {active.length > 0
                  ? 'รวมรอบจ่ายหลักให้แล้ว จะได้เห็นว่าแต่ละเดือนเงินไหลออกเท่าไรแบบไม่ต้องไล่จำเอง'
                  : 'เริ่มจากเพิ่มบริการที่จ่ายประจำไว้ก่อน แล้วเดี๋ยวน้องจะตามให้เองเป็นรอบ ๆ'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <SummaryPanel
                label="ประมาณต่อปี"
                value={formatCurrency(monthlyTotal * 12)}
                tone="primary"
              />
              <SummaryPanel
                label="จำนวนรายการ"
                value={`${active.length} รายการ`}
                note={
                  closestDue
                    ? `${closestDue.name} ${closestDue.days === 0 ? 'จ่ายวันนี้' : closestDue.days === 1 ? 'จ่ายพรุ่งนี้' : `อีก ${closestDue.days} วัน`}`
                    : 'ยังไม่มีรายการที่ใกล้ครบกำหนด'
                }
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pt-2 no-scrollbar safe-bottom">
        {loading ? (
          <>
            {[0, 1, 2].map((item) => (
              <SubSkeleton key={item} />
            ))}
          </>
        ) : subscriptions.length === 0 ? (
          <div className="flex min-h-full items-center justify-center pb-20">
            <EmptyState />
          </div>
        ) : view === 'calendar' ? (
          <div className="rounded-[1.7rem] border border-white/8 bg-white/[0.04] p-4 shadow-[0_22px_42px_-30px_rgba(0,0,0,1)]">
            <CalendarView subscriptions={subscriptions} />
          </div>
        ) : (
          <div className="space-y-8 pb-4">
            <section className="space-y-4">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-[11px] font-medium tracking-[0.16em] text-muted-foreground uppercase">
                    Active list
                  </p>
                  <h2 className="mt-1 text-[1.05rem] font-semibold tracking-[-0.03em] text-foreground">
                    รายการทั้งหมด
                  </h2>
                </div>
                <span className="text-[12px] font-semibold text-primary numeric-tabular">
                  {subscriptions.length} รายการ
                </span>
              </div>

              <div className="space-y-4">
                <AnimatePresence>
                  {subscriptions.map((sub, index) => (
                    <SubCard
                      key={sub.id}
                      sub={sub}
                      onTap={(current) => {
                        setEditSub(current)
                        setFormOpen(true)
                      }}
                      index={index}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </section>
          </div>
        )}
      </div>

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
