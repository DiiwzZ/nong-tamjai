import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useStore } from '@/store/useStore'
import { formatCurrency } from '@/lib/utils'
import { PageHeader } from '@/components/layout/PageHeader'

/* ── Icons ── */
const UsersIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)

/* ── PersonCard ── */
function PersonCard({ name, items, onTogglePaid }) {
  const unpaidItems = items.filter(({ member }) => !member.paid)
  const totalOwed   = unpaidItems.reduce((s, { member }) => s + (member.share || 0), 0)
  const allDone     = unpaidItems.length === 0

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
      animate={{ opacity: allDone ? 0.52 : 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
      style={{
        background: '#1a1a22',
        border: '1px solid #252530',
        borderRadius: 18,
        marginBottom: 10,
        overflow: 'hidden',
      }}
    >
      {/* Person header */}
      <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12, flexShrink: 0,
          background: allDone ? 'rgba(74,222,128,0.10)' : 'rgba(59,130,246,0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, fontWeight: 800,
          color: allDone ? '#4ade80' : '#3b82f6',
        }}>
          {name[0]?.toUpperCase()}
        </div>

        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 16, fontWeight: 700, color: '#f0f0f8', marginBottom: 2 }}>{name}</p>
          <p style={{ fontSize: 12, fontWeight: 600, color: allDone ? '#4ade80' : '#f87171' }}>
            {allDone ? '✓ ครบแล้ว' : `ค้าง ${formatCurrency(totalOwed)}`}
          </p>
        </div>

        {!allDone && (
          <span style={{ fontSize: 20, fontWeight: 800, color: '#f0f0f8', letterSpacing: '-0.5px' }}>
            {formatCurrency(totalOwed)}
          </span>
        )}
      </div>

      {/* Subscription rows */}
      <div style={{ borderTop: '1px solid #252530' }}>
        {items.map(({ sub, member }, idx) => (
          <div
            key={`${sub.id}-${member.id}`}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '11px 16px',
              borderBottom: idx < items.length - 1 ? '1px solid rgba(37,37,48,0.6)' : 'none',
              opacity: member.paid ? 0.4 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            {/* Brand dot */}
            <div style={{
              width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
              background: sub.color || '#6b7280',
            }} />

            <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: '#d0d0e0',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {sub.name}
            </span>

            <span style={{ fontSize: 14, fontWeight: 700, color: '#f0f0f8', marginRight: 8, flexShrink: 0 }}>
              {formatCurrency(member.share || 0)}
            </span>

            <button
              type="button"
              onClick={() => onTogglePaid(sub.id, member.id, !member.paid)}
              style={{
                height: 30, padding: '0 11px', borderRadius: 9, flexShrink: 0,
                background: member.paid ? 'rgba(74,222,128,0.10)' : '#252530',
                border: `1px solid ${member.paid ? 'rgba(74,222,128,0.28)' : '#3b3b50'}`,
                color: member.paid ? '#4ade80' : '#6b6b88',
                fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                whiteSpace: 'nowrap', transition: 'all 0.18s',
              }}
            >
              {member.paid ? '✓ ได้รับ' : 'ได้รับแล้ว?'}
            </button>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

/* ── First-time name setup ── */
function SetupName({ onConfirm }) {
  const [name, setName] = useState('')
  const ready = name.trim().length > 0

  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 28px' }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, textAlign: 'center' }}
      >
        <motion.div
          initial={{ scale: 0.75, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.08, type: 'spring', stiffness: 260, damping: 22 }}
          style={{
            width: 84, height: 84, borderRadius: 24,
            background: 'linear-gradient(145deg, rgba(59,130,246,0.16) 0%, rgba(99,102,241,0.08) 100%)',
            border: '1px solid rgba(59,130,246,0.24)',
            boxShadow: '0 0 36px rgba(59,130,246,0.12), inset 0 1px 0 rgba(255,255,255,0.06)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <UsersIcon />
        </motion.div>

        <div>
          <p style={{ fontSize: 20, fontWeight: 800, color: '#f0f0f8', marginBottom: 8, letterSpacing: '-0.3px' }}>
            ชื่อของคุณคือ?
          </p>
          <p style={{ fontSize: 14, color: '#6b6b88', lineHeight: 1.5 }}>
            เพื่อแยกระหว่างคุณกับเพื่อน<br/>ในระบบ Split
          </p>
        </div>

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="ใส่ชื่อคุณ..."
          style={{
            width: '100%', height: 54,
            background: '#1a1a22', border: '1px solid #252530',
            borderRadius: 16, padding: '0 16px',
            fontSize: 18, fontWeight: 600, color: '#f0f0f8',
            outline: 'none', fontFamily: 'inherit', colorScheme: 'dark',
            textAlign: 'center', letterSpacing: '0.01em',
          }}
          onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
          onBlur={(e) => (e.target.style.borderColor = '#252530')}
          onKeyDown={(e) => e.key === 'Enter' && ready && onConfirm(name.trim())}
        />

        <motion.button
          type="button"
          whileTap={ready ? { scale: 0.97 } : {}}
          onClick={() => ready && onConfirm(name.trim())}
          style={{
            width: '100%', height: 54, borderRadius: 16,
            background: ready ? '#3b82f6' : '#1e1e28',
            border: 'none',
            color: ready ? '#fff' : '#3b3b50',
            fontSize: 17, fontWeight: 700,
            cursor: ready ? 'pointer' : 'default',
            fontFamily: 'inherit',
            transition: 'background 0.2s, color 0.2s',
            boxShadow: ready ? '0 4px 20px rgba(59,130,246,0.32)' : 'none',
          }}
        >
          ยืนยัน
        </motion.button>
      </motion.div>
    </div>
  )
}

/* ── Empty state ── */
function EmptyState() {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, textAlign: 'center', padding: '0 28px' }}
      >
        <motion.div
          initial={{ scale: 0.75, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.08, type: 'spring', stiffness: 260, damping: 22 }}
          style={{
            width: 84, height: 84, borderRadius: 24,
            background: 'linear-gradient(145deg, rgba(59,130,246,0.12) 0%, rgba(99,102,241,0.06) 100%)',
            border: '1px solid rgba(59,130,246,0.20)',
            boxShadow: '0 0 32px rgba(59,130,246,0.08), inset 0 1px 0 rgba(255,255,255,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <UsersIcon />
        </motion.div>
        <div>
          <p style={{ fontSize: 17, fontWeight: 700, color: '#f0f0f8', marginBottom: 6 }}>
            ยังไม่มีการหารค่า
          </p>
          <p style={{ fontSize: 13, color: '#6b6b88', lineHeight: 1.6 }}>
            แก้ไข Subscription ที่ต้องการ<br/>แล้วเปิด "หารกัน" เพื่อเริ่มต้น
          </p>
        </div>
      </motion.div>
    </div>
  )
}

/* ── Page ── */
export function Split() {
  const { subscriptions, userName, setUserName, markSplitPaid } = useStore()

  // Subs that have split enabled and have at least 2 members
  const splitSubs = useMemo(() =>
    subscriptions.filter(
      (s) => s.split?.enabled && (s.split?.members?.length ?? 0) > 1
    ),
  [subscriptions])

  // Group members (excluding user) by name → list of { sub, member }
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

  const totalOwed = useMemo(() =>
    Object.values(byPerson)
      .flat()
      .filter(({ member }) => !member.paid)
      .reduce((s, { member }) => s + (member.share || 0), 0),
  [byPerson])

  const allPeople = Object.entries(byPerson)
  const pending   = allPeople.filter(([, items]) => items.some((i) => !i.member.paid))
  const done      = allPeople.filter(([, items]) => items.every((i) => i.member.paid))

  const headerRight = totalOwed > 0 ? (
    <span style={{
      fontSize: 13, fontWeight: 700, color: '#f87171',
      padding: '4px 10px', borderRadius: 9,
      background: 'rgba(248,113,113,0.12)',
      border: '1px solid rgba(248,113,113,0.20)',
    }}>
      ค้างรับ {formatCurrency(totalOwed)}
    </span>
  ) : totalOwed === 0 && allPeople.length > 0 ? (
    <span style={{
      fontSize: 13, fontWeight: 700, color: '#4ade80',
      padding: '4px 10px', borderRadius: 9,
      background: 'rgba(74,222,128,0.10)',
      border: '1px solid rgba(74,222,128,0.20)',
    }}>
      ✓ ครบทั้งหมด
    </span>
  ) : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <PageHeader title="Split" right={headerRight} />

      {!userName ? (
        <SetupName onConfirm={setUserName} />
      ) : splitSubs.length === 0 ? (
        <EmptyState />
      ) : (
        <div
          className="no-scrollbar"
          style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 100px', display: 'flex', flexDirection: 'column' }}
        >
          <AnimatePresence>
            {pending.map(([name, items]) => (
              <PersonCard key={name} name={name} items={items} onTogglePaid={markSplitPaid} />
            ))}
          </AnimatePresence>

          {done.length > 0 && (
            <>
              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '6px 0 14px' }}>
                <div style={{ flex: 1, height: 1, background: '#252530' }} />
                <span style={{
                  fontSize: 10, fontWeight: 800, color: '#3b3b50',
                  textTransform: 'uppercase', letterSpacing: '0.12em',
                }}>
                  ครบแล้ว
                </span>
                <div style={{ flex: 1, height: 1, background: '#252530' }} />
              </div>

              <AnimatePresence>
                {done.map(([name, items]) => (
                  <PersonCard key={name} name={name} items={items} onTogglePaid={markSplitPaid} />
                ))}
              </AnimatePresence>
            </>
          )}
        </div>
      )}
    </div>
  )
}
