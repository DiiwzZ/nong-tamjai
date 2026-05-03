import { motion } from 'motion/react'

const tabs = [
  {
    id: 'tasks',
    label: 'งาน',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="3"/>
        <path d="M9 12l2 2 4-4"/>
      </svg>
    ),
  },
  {
    id: 'subscriptions',
    label: 'Subs',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2"/>
        <path d="M1 10h22"/>
      </svg>
    ),
  },
  {
    id: 'split',
    label: 'Split',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    id: 'dashboard',
    label: 'ภาพรวม',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1.5"/>
        <rect x="14" y="3" width="7" height="7" rx="1.5"/>
        <rect x="3" y="14" width="7" height="7" rx="1.5"/>
        <rect x="14" y="14" width="7" height="7" rx="1.5"/>
      </svg>
    ),
  },
]

export function BottomNav({ active, onChange }) {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-30 px-3 pb-[34px]">
      <div
        className="flex rounded-[20px] px-1 py-1"
        style={{
          background: 'rgba(26,26,34,0.97)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid #252530',
          boxShadow: '0 -4px 32px rgba(0,0,0,0.5)',
        }}
      >
        {tabs.map(({ id, label, icon }) => {
          const isActive = active === id
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              className="flex-1 flex flex-col items-center gap-[3px] py-2.5 select-none border-none cursor-pointer"
              style={{
                background: 'transparent',
                position: 'relative',
                borderRadius: 14,
                color: isActive ? '#3b82f6' : 'rgba(107,107,136,0.6)',
              }}
            >
              {/* Spring-sliding active background */}
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(59,130,246,0.12)',
                    borderRadius: 14,
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}

              {/* Icon */}
              <motion.div
                animate={{
                  scale: isActive ? 1.12 : 1,
                  opacity: isActive ? 1 : 0.45,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                style={{ lineHeight: 1, position: 'relative', zIndex: 1 }}
              >
                {icon}
              </motion.div>

              {/* Label */}
              <motion.span
                animate={{ opacity: isActive ? 1 : 0.38 }}
                transition={{ duration: 0.18 }}
                className="text-[10px] font-bold tracking-wide"
                style={{ position: 'relative', zIndex: 1 }}
              >
                {label}
              </motion.span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
