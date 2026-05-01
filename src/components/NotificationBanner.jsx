import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Bell, X } from 'lucide-react'
import { requestPermission } from '@/lib/notifications'

export function NotificationBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!('Notification' in window)) return
    if (Notification.permission === 'default') {
      const timer = setTimeout(() => setShow(true), 1500)
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
          className="fixed bottom-24 left-4 right-4 max-w-[400px] mx-auto z-40 bg-card border border-border rounded-2xl p-4 shadow-xl"
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Bell size={18} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">เปิดการแจ้งเตือน</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                รับแจ้งเตือนก่อนถึงวันจ่าย subscription และ task ที่ใกล้ครบกำหนด
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={allow}
                  className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium"
                >
                  อนุญาต
                </button>
                <button
                  onClick={() => setShow(false)}
                  className="px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-xs font-medium"
                >
                  ไว้ทีหลัง
                </button>
              </div>
            </div>
            <button onClick={() => setShow(false)} className="text-muted-foreground p-1">
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
