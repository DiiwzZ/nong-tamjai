import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { CheckCircle2, ChevronDown, Sparkles, Users, Wallet } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { useStore } from '@/store/useStore'
import { formatCurrency } from '@/lib/utils'

function SummaryChip({ label, value, tone = 'default' }) {
  const toneClass = {
    default: 'border-white/8 bg-white/[0.04] text-foreground',
    primary: 'border-primary/18 bg-primary/10 text-primary',
    success: 'border-emerald-400/18 bg-emerald-400/10 text-emerald-300',
  }

  return (
    <div className={`rounded-[1.15rem] border px-4 py-3 shadow-[0_18px_34px_-26px_rgba(0,0,0,1)] ${toneClass[tone]}`}>
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className="mt-2 numeric-tabular text-[1.25rem] font-black leading-none tracking-[-0.045em]">{value}</p>
    </div>
  )
}

function PersonCard({ name, items, onTogglePaid }) {
  const unpaidItems = items.filter(({ member }) => !member.paid)
  const totalOwed = unpaidItems.reduce((sum, { member }) => sum + (member.share || 0), 0)
  const allDone = unpaidItems.length === 0
  const multiSub = items.length > 1
  const [expanded, setExpanded] = useState(!multiSub)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: allDone ? 0.64 : 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ type: 'spring', stiffness: 340, damping: 28 }}
      className="overflow-hidden rounded-[1.55rem] border border-white/8 bg-[linear-gradient(180deg,rgba(32,35,52,0.92),rgba(21,24,36,0.96))] shadow-[0_22px_42px_-28px_rgba(0,0,0,1)]"
    >
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        className="flex w-full items-center gap-3 px-4 py-4 text-left"
      >
        <div
          className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[0.95rem] text-base font-extrabold ${
            allDone
              ? 'border border-emerald-400/16 bg-emerald-400/10 text-emerald-300'
              : 'border border-primary/16 bg-primary/10 text-primary'
          }`}
        >
          {name[0]?.toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold tracking-[-0.02em] text-foreground">{name}</p>
          <p className={`mt-1 text-xs font-medium ${allDone ? 'text-emerald-300' : 'text-rose-300'}`}>
            {allDone ? 'เคลียร์ครบแล้ว' : `ค้างรับ ${formatCurrency(totalOwed)}`}
          </p>
        </div>

        <div className="flex items-center gap-2 pl-2">
          {multiSub && (
            <span className="rounded-full border border-white/8 bg-white/[0.05] px-2.5 py-1 text-[10px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
              {items.length} subs
            </span>
          )}

          {!allDone && (
            <span className="numeric-tabular text-[1rem] font-black tracking-[-0.04em] text-foreground">
              {formatCurrency(totalOwed)}
            </span>
          )}

          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="text-muted-foreground"
          >
            <ChevronDown size={15} />
          </motion.span>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden border-t border-white/[0.06]"
          >
            {items.map(({ sub, member }, index) => (
              <div
                key={`${sub.id}-${member.id}`}
                className={`flex items-center gap-3 px-4 py-3 ${index < items.length - 1 ? 'border-b border-white/[0.05]' : ''} ${member.paid ? 'opacity-45' : 'opacity-100'}`}
              >
                <div
                  className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: sub.color || '#6b7280' }}
                />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-foreground">{sub.name}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {member.paid ? 'รับเงินแล้ว' : 'รอรับเงิน'}
                  </p>
                </div>

                <span className="numeric-tabular pr-1 text-[13px] font-bold text-foreground">
                  {formatCurrency(member.share || 0)}
                </span>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    onTogglePaid(sub.id, member.id, !member.paid)
                  }}
                  className={`rounded-[0.8rem] border px-3 py-2 text-[11px] font-semibold transition-all ${
                    member.paid
                      ? 'border-emerald-400/18 bg-emerald-400/10 text-emerald-300'
                      : 'border-white/8 bg-white/[0.04] text-muted-foreground'
                  }`}
                >
                  {member.paid ? 'รับแล้ว' : 'ได้แล้ว?'}
                </button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function SetupName({ onConfirm }) {
  const [name, setName] = useState('')
  const ready = name.trim().length > 0

  return (
    <div className="flex flex-1 items-center justify-center px-7 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-[24rem] space-y-6 text-center"
      >
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.7rem] border border-primary/18 bg-primary/10 shadow-[0_22px_42px_-28px_rgba(0,0,0,1)]">
          <Users size={34} className="text-primary" />
        </div>

        <div className="space-y-3">
          <h2 className="text-[1.55rem] font-black tracking-[-0.05em] text-foreground">
            ชื่อของคุณคืออะไร
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            ตั้งชื่อไว้ก่อน เพื่อให้น้องแยกว่ารายการไหนเป็นของคุณ และรายการไหนเป็นของเพื่อนในหน้า Split
          </p>
        </div>

        <div className="space-y-3">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="ใส่ชื่อของคุณ..."
            className="h-14 w-full rounded-[1rem] border border-white/8 bg-white/[0.04] px-4 text-center text-base font-semibold text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/30"
            onKeyDown={(event) => {
              if (event.key === 'Enter' && ready) {
                onConfirm(name.trim())
              }
            }}
          />

          <motion.button
            type="button"
            whileTap={ready ? { scale: 0.98 } : {}}
            onClick={() => ready && onConfirm(name.trim())}
            className={`h-14 w-full rounded-[1rem] text-base font-bold transition-all ${
              ready
                ? 'bg-primary text-white shadow-[0_18px_34px_-18px_rgba(59,130,246,0.9)]'
                : 'bg-white/[0.04] text-muted-foreground'
            }`}
          >
            เริ่มใช้งาน
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-1 items-center justify-center px-7 pb-20">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-[24rem] space-y-6 text-center"
      >
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.7rem] border border-primary/16 bg-white/[0.04] shadow-[0_22px_42px_-28px_rgba(0,0,0,1)]">
          <Users size={34} className="text-primary" />
        </div>

        <div className="space-y-3">
          <h2 className="text-[1.45rem] font-black tracking-[-0.05em] text-foreground">
            ยังไม่มีรายการหารกัน
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            เปิดการหารในหน้า subscription ก่อน แล้วรายการที่แชร์กับเพื่อนจะถูกดึงมารวมในหน้านี้ให้อัตโนมัติ
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export function Split({ onSettings }) {
  const { subscriptions, userName, setUserName, markSplitPaid } = useStore()

  const splitSubs = useMemo(
    () =>
      subscriptions.filter(
        (subscription) => subscription.split?.enabled && (subscription.split?.members?.length ?? 0) > 1
      ),
    [subscriptions]
  )

  const byPerson = useMemo(() => {
    const map = {}
    splitSubs.forEach((sub) => {
      ;(sub.split.members || []).forEach((member) => {
        if (member.name === userName) return
        if (!map[member.name]) map[member.name] = []
        map[member.name].push({ sub, member })
      })
    })
    return map
  }, [splitSubs, userName])

  const totalOwed = useMemo(
    () =>
      Object.values(byPerson)
        .flat()
        .filter(({ member }) => !member.paid)
        .reduce((sum, { member }) => sum + (member.share || 0), 0),
    [byPerson]
  )

  const people = Object.entries(byPerson)
  const pending = people.filter(([, items]) => items.some(({ member }) => !member.paid))
  const settled = people.filter(([, items]) => items.every(({ member }) => member.paid))

  const headerRight = totalOwed > 0 ? (
    <span className="rounded-full border border-rose-400/18 bg-rose-400/10 px-3 py-1.5 text-[12px] font-semibold text-rose-300">
      ค้างรับ {formatCurrency(totalOwed)}
    </span>
  ) : people.length > 0 ? (
    <span className="rounded-full border border-emerald-400/18 bg-emerald-400/10 px-3 py-1.5 text-[12px] font-semibold text-emerald-300">
      รับครบแล้ว
    </span>
  ) : null

  const headerSub = userName ? (
    <div className="grid grid-cols-2 gap-3">
      <SummaryChip label="คนที่ยังค้าง" value={`${pending.length} คน`} tone="primary" />
      <SummaryChip label="เคลียร์ครบแล้ว" value={`${settled.length} คน`} tone="success" />
    </div>
  ) : null

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="หารกัน" right={headerRight} sub={headerSub} onSettings={onSettings} />

      {!userName ? (
        <SetupName onConfirm={setUserName} />
      ) : splitSubs.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="no-scrollbar flex-1 overflow-y-auto px-4 pb-24 pt-4">
          <div className="space-y-8">
            <section className="space-y-4">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    Pending collection
                  </p>
                  <h2 className="mt-1 text-[1.05rem] font-semibold tracking-[-0.03em] text-foreground">
                    คนที่ยังต้องตาม
                  </h2>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.04] px-3 py-1 text-[11px] font-semibold text-muted-foreground">
                  <Sparkles size={12} />
                  {pending.length > 0 ? `${pending.length} คน` : 'ไม่มีค้างแล้ว'}
                </div>
              </div>

              {pending.length === 0 ? (
                <div className="rounded-[1.45rem] border border-dashed border-white/10 px-5 py-6 text-sm leading-6 text-muted-foreground">
                  ตอนนี้ไม่มีคนที่ยังค้างรับแล้ว ทุกคนในลิสต์โอนครบเรียบร้อย
                </div>
              ) : (
                <div className="space-y-3.5">
                  <AnimatePresence>
                    {pending.map(([name, items]) => (
                      <PersonCard key={name} name={name} items={items} onTogglePaid={markSplitPaid} />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </section>

            {settled.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-white/[0.08]" />
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/16 bg-emerald-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-300">
                    <CheckCircle2 size={12} />
                    Settled
                  </span>
                  <div className="h-px flex-1 bg-white/[0.08]" />
                </div>

                <div className="space-y-3.5">
                  <AnimatePresence>
                    {settled.map(([name, items]) => (
                      <PersonCard key={name} name={name} items={items} onTogglePaid={markSplitPaid} />
                    ))}
                  </AnimatePresence>
                </div>
              </section>
            )}

            <section className="rounded-[1.55rem] border border-white/8 bg-white/[0.04] p-4 shadow-[0_20px_40px_-28px_rgba(0,0,0,1)]">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[0.95rem] border border-primary/16 bg-primary/10 text-primary">
                  <Wallet size={18} />
                </div>
                <div>
                  <p className="text-sm font-semibold tracking-[-0.02em] text-foreground">
                    วิธีใช้งานให้ลื่นที่สุด
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    ถ้าจะเพิ่มรายการใหม่ ให้เปิดที่หน้า subscription แล้วเปิด “หารกัน” จากตรงนั้น หน้านี้จะทำหน้าที่รวมยอดและเช็กสถานะการจ่ายให้แบบอ่านง่าย
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  )
}
