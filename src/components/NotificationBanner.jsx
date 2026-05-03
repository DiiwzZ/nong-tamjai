import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { requestPermission } from '@/lib/notifications'

export function NotificationBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!('Notification' in window)) return
    if (Notification.permission === 'default') {
      const timer = setTimeout(() => setShow(true), 2000)
      return () => clearTimeout(timer)
    }
  }, [])

  const allow = async () => {
    await requestPermission()
    setShow(false)
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          style={{
            position: 'fixed', bottom: 96, left: 16, right: 16,
            maxWidth: 398, margin: '0 auto',
            zIndex: 40,
            background: '#1a1a22',
            border: '1px solid #252530',
            borderRadius: 20,
            padding: '16px',
            boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            {/* Icon */}
            <div style={{
              width: 40, height: 40, borderRadius: 12, flexShrink: 0,
              background: 'rgba(59,130,246,0.12)',
              border: '1px solid rgba(59,130,246,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18,
            }}>
              🔔
            </div>

            {/* Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: '#f0f0f8', marginBottom: 3 }}>
                เปิดการแจ้งเตือน
              </p>
              <p style={{ fontSize: 13, color: '#6b6b88', lineHeight: 1.5, marginBottom: 12 }}>
                รับแจ้งเตือนก่อนถึงวันจ่าย subscription และ task ที่ใกล้ครบกำหนด
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={allow}
                  style={{
                    height: 36, padding: '0 16px', borderRadius: 10,
                    background: '#3b82f6', border: 'none',
                    color: '#fff', fontSize: 13, fontWeight: 700,
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  อนุญาต
                </button>
                <button
                  onClick={() => setShow(false)}
                  style={{
                    height: 36, padding: '0 14px', borderRadius: 10,
                    background: '#252530', border: '1px solid #3b3b50',
                    color: '#6b6b88', fontSize: 13, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  ไว้ทีหลัง
                </button>
              </div>
            </div>

            {/* Close */}
            <button
              onClick={() => setShow(false)}
              style={{
                width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                background: '#252530', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M1 1l10 10M11 1L1 11" stroke="#6b6b88" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
