import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { CreditCard, List, CalendarDays } from 'lucide-react'
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
  active:    { label: 'Active',  color: 'text-emerald-400 bg-emerald-500/12' },
  paused:    { label: 'Paused',  color: 'text-amber-400  bg-amber-500/12'  },
  trial:     { label: 'Trial',   color: 'text-blue-400   bg-blue-500/12'   },
  cancelled: { label: 'ยกเลิก', color: 'text-muted-foreground bg-muted'    },
}

const BILLING_CYCLES = [
  { id: 'monthly', label: 'รายเดือน' },
  { id: 'yearly',  label: 'รายปี'    },
  { id: 'manual',  label: 'กดจ่ายเอง' },
]

const PAYMENT_METHODS = ['เดบิต', 'เครดิต', 'PromptPay', 'อื่นๆ']

const POPULAR_SUBS = [
  { name: 'Netflix',          color: '#E50914' },
  { name: 'Spotify',          color: '#1DB954' },
  { name: 'YouTube Premium',  color: '#FF0000' },
  { name: 'iCloud',           color: '#3b82f6' },
  { name: 'ChatGPT',          color: '#10a37f' },
  { name: 'Adobe',            color: '#FF0000' },
]

function createInitialSubForm(sub) {
  return {
    name: sub?.name || '',
    amount: sub?.amount || '',
    billingCycle: sub?.billingCycle || 'monthly',
    nextBillingDate: sub?.nextBillingDate?.slice(0, 10) || '',
    paymentMethod: sub?.paymentMethod || 'เดบิต',
    status: sub?.status || 'active',
    alertDays: sub?.alertDays || 3,
    color: sub?.color || '#6b7280',
    note: sub?.note || '',
  }
}

/* ── Sub card ── */
function SubCard({ sub, onTap, index = 0 }) {
  const days    = daysUntil(sub.nextBillingDate)
  const status  = STATUS_LABELS[sub.status] || STATUS_LABELS.active
  const isUrgent = days !== null && days <= 3 && sub.status === 'active'
  const monthlyAmount = sub.billingCycle === 'yearly' ? sub.amount / 12 : sub.amount

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ delay: index * 0.04, duration: 0.22 }}
      whileTap={{ scale: 0.983 }}
      onClick={() => onTap(sub)}
      className={cn(
        'rounded-2xl mb-2.5 cursor-pointer select-none',
        'border-l-[3px] border-t border-r border-b border-border',
        isUrgent ? 'bg-red-500/6' : 'bg-card',
      )}
      style={{ borderLeftColor: sub.color || 'var(--color-border)' }}
    >
      <div className="px-4 py-3.5 flex items-center gap-3">
        {/* Colored initial avatar */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-[15px] font-black flex-shrink-0"
          style={{ backgroundColor: sub.color || '#6b7280' }}
        >
          {sub.name?.[0]?.toUpperCase()}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[14px] font-bold text-foreground truncate">{sub.name}</p>
            <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0', status.color)}>
              {status.label}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            {sub.paymentMethod && (
              <span className="text-[11px] text-muted-foreground">{sub.paymentMethod}</span>
            )}
            {sub.nextBillingDate && days !== null && (
              <span className={cn(
                'text-[11px] font-semibold',
                isUrgent ? 'text-destructive' : 'text-muted-foreground'
              )}>
                {days === 0 ? 'จ่ายวันนี้' : days === 1 ? 'พรุ่งนี้' : `อีก ${days} วัน`}
              </span>
            )}
          </div>
        </div>

        {/* Amount */}
        <div className="text-right flex-shrink-0">
          <p className="text-[15px] font-black text-foreground">{formatCurrency(sub.amount)}</p>
          {sub.billingCycle === 'yearly' && (
            <p className="text-[10px] text-muted-foreground mt-0.5">{formatCurrency(monthlyAmount)}/เดือน</p>
          )}
          <p className="text-[10px] text-muted-foreground">
            {BILLING_CYCLES.find((b) => b.id === sub.billingCycle)?.label}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

/* ── Sub form (sheet) ── */
function SubForm({ open, onClose, sub }) {
  const { addSubscription, updateSubscription } = useStore()
  const isEdit = !!sub

  const [form, setForm] = useState(() => createInitialSubForm(sub))

  useEffect(() => {
    if (open) setForm(createInitialSubForm(sub))
  }, [open, sub])

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))

  const handleSubmit = () => {
    if (!form.name.trim() || !form.amount) return
    const data = {
      ...form,
      amount: parseFloat(form.amount),
      nextBillingDate: form.nextBillingDate
        ? new Date(form.nextBillingDate).toISOString()
        : null,
    }
    isEdit ? updateSubscription(sub.id, data) : addSubscription(data)
    onClose()
  }

  return (
    <Sheet open={open} onClose={onClose} title={isEdit ? 'แก้ไข Subscription' : 'Subscription ใหม่'}>
      <div className="px-5 py-4 flex flex-col gap-4 pb-8">

        {/* Popular quick-select */}
        {!isEdit && (
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-black uppercase tracking-[0.1em] text-muted-foreground">
              บริการยอดนิยม
            </label>
            <div className="flex gap-2 flex-wrap">
              {POPULAR_SUBS.map((item) => (
                <button
                  key={item.name}
                  onClick={() => { set('name', item.name); set('color', item.color) }}
                  className={cn(
                    'px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all',
                    form.name === item.name ? 'ring-2 ring-white/50 scale-105 shadow-lg' : 'opacity-75'
                  )}
                  style={{ backgroundColor: item.color }}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <Input label="ชื่อ" placeholder="ชื่อ subscription..." value={form.name}
          onChange={(e) => set('name', e.target.value)} />

        <Input label="ราคา (บาท)" type="number" placeholder="0" value={form.amount}
          onChange={(e) => set('amount', e.target.value)} inputMode="decimal" />

        {/* Billing cycle */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-black uppercase tracking-[0.1em] text-muted-foreground">รอบจ่าย</label>
          <div className="flex gap-2">
            {BILLING_CYCLES.map((b) => (
              <button key={b.id} onClick={() => set('billingCycle', b.id)}
                className={cn(
                  'flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all',
                  form.billingCycle === b.id
                    ? 'bg-primary text-white border-primary'
                    : 'bg-muted text-muted-foreground border-transparent'
                )}>
                {b.label}
              </button>
            ))}
          </div>
        </div>

        <Input label="วันจ่ายครั้งถัดไป" type="date" value={form.nextBillingDate}
          onChange={(e) => set('nextBillingDate', e.target.value)} />

        {/* Payment method */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-black uppercase tracking-[0.1em] text-muted-foreground">ช่องทางชำระ</label>
          <div className="flex gap-2 flex-wrap">
            {PAYMENT_METHODS.map((m) => (
              <button key={m} onClick={() => set('paymentMethod', m)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-bold border transition-all',
                  form.paymentMethod === m
                    ? 'bg-primary text-white border-primary'
                    : 'bg-muted text-muted-foreground border-transparent'
                )}>
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Status */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-black uppercase tracking-[0.1em] text-muted-foreground">สถานะ</label>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(STATUS_LABELS).map(([key, val]) => (
              <button key={key} onClick={() => set('status', key)}
                className={cn(
                  'px-3 py-1.5 rounded-xl text-xs font-bold border transition-all',
                  form.status === key
                    ? 'bg-primary text-white border-primary'
                    : 'bg-muted text-muted-foreground border-transparent'
                )}>
                {val.label}
              </button>
            ))}
          </div>
        </div>

        {/* Alert days */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-black uppercase tracking-[0.1em] text-muted-foreground">
            แจ้งเตือนล่วงหน้า: <span className="text-primary">{form.alertDays} วัน</span>
          </label>
          <input type="range" min="1" max="14" value={form.alertDays}
            onChange={(e) => set('alertDays', parseInt(e.target.value))} />
        </div>

        <Button onClick={handleSubmit} className="w-full mt-2">
          {isEdit ? 'บันทึก' : 'เพิ่ม Subscription'}
        </Button>
      </div>
    </Sheet>
  )
}

/* ── Main page ── */
export function Subscriptions() {
  const { subscriptions } = useStore()
  const [formOpen, setFormOpen] = useState(false)
  const [editSub, setEditSub]   = useState(null)
  const [view, setView]         = useState('list')
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 400)
    return () => clearTimeout(t)
  }, [])

  const active  = subscriptions.filter((s) => s.status !== 'cancelled')
  const monthly = active.reduce((sum, s) => {
    if (s.billingCycle === 'yearly')  return sum + s.amount / 12
    if (s.billingCycle === 'monthly') return sum + s.amount
    return sum
  }, 0)

  const handleTap = (sub) => { setEditSub(sub); setFormOpen(true) }
  const openNew   = () => { setEditSub(null); setFormOpen(true) }

  return (
    <div className="flex flex-col h-full">

      <Header
        title="น้องเตือน"
        rightAction={
          subscriptions.length > 0 && (
            <div className="flex gap-1 bg-muted rounded-xl p-1">
              <button
                onClick={() => setView('list')}
                className={cn('p-1.5 rounded-lg transition-colors',
                  view === 'list' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground')}
              >
                <List size={16} />
              </button>
              <button
                onClick={() => setView('calendar')}
                className={cn('p-1.5 rounded-lg transition-colors',
                  view === 'calendar' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground')}
              >
                <CalendarDays size={16} />
              </button>
            </div>
          )
        }
      />

      {/* ── Summary banner ── */}
      {active.length > 0 && (
        <div className="px-5 pb-4">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="relative overflow-hidden rounded-3xl p-5"
            style={{ background: 'linear-gradient(135deg, hsl(268 80% 42%), hsl(228 40% 14%))' }}
          >
            <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-violet-500/20 blur-2xl pointer-events-none" />
            <div className="relative">
              <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.1em]">รวมรายเดือน</p>
              <p className="text-4xl font-black text-white mt-1.5 tracking-tighter leading-none">
                {formatCurrency(monthly)}
              </p>
              <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/10">
                <p className="text-[12px] text-white/50 font-medium">{formatCurrency(monthly * 12)}/ปี</p>
                <span className="w-1 h-1 rounded-full bg-white/30" />
                <p className="text-[12px] text-white/50 font-medium">{active.length} รายการ</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Empty state: sibling div so flex-1 truly centers it ── */}
      {!loading && subscriptions.length === 0 && (
        <div className="flex-1 flex items-center justify-center px-5 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-5 text-center"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              className="w-24 h-24 rounded-3xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center"
            >
              <CreditCard size={38} className="text-violet-400" />
            </motion.div>
            <div>
              <p className="text-xl font-black text-foreground tracking-tight">ยังไม่มีรายจ่าย</p>
              <p className="text-sm text-muted-foreground mt-1.5 font-medium">กด + ให้น้องช่วยติดตาม</p>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── List / Calendar: only when loading or has content ── */}
      {(loading || subscriptions.length > 0) && (
        <div className="flex-1 overflow-y-auto no-scrollbar px-5 safe-bottom">
          {loading ? (
            <>{[0, 1, 2].map((i) => <SubSkeleton key={i} />)}</>
          ) : view === 'calendar' ? (
            <CalendarView subscriptions={subscriptions} />
          ) : (
            <AnimatePresence>
              {subscriptions.map((sub, i) => (
                <SubCard key={sub.id} sub={sub} onTap={handleTap} index={i} />
              ))}
            </AnimatePresence>
          )}
        </div>
      )}

      <QuickAddFAB onSelect={openNew} />

      <SubForm
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditSub(null) }}
        sub={editSub}
      />
    </div>
  )
}
