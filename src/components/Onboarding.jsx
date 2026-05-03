import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { useStore } from '@/store/useStore'

const SLIDES = [
  {
    emoji: '✅',
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.12)',
    border: 'rgba(59,130,246,0.2)',
    title: 'จัดการ Task',
    desc: 'เพิ่ม task พร้อม priority และ due date เห็นภาพรวมชัดเจน',
  },
  {
    emoji: '💳',
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.12)',
    border: 'rgba(139,92,246,0.2)',
    title: 'ติดตาม Subscription',
    desc: 'รู้ว่าเดือนนี้จ่ายอะไรบ้าง และจ่ายรวมเท่าไหร่ต่อเดือน',
  },
  {
    emoji: '🔔',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.2)',
    title: 'แจ้งเตือนล่วงหน้า',
    desc: 'ตั้งให้แจ้งเตือนก่อนถึงวันจ่าย subscription และ due date',
  },
]

export function Onboarding() {
  const { update } = useStore()
  const [step, setStep] = useState(0)

  const isLast = step === SLIDES.length - 1
  const slide = SLIDES[step]

  const finish = () => update({ onboardingDone: true })
  const next = () => (isLast ? finish() : setStep((s) => s + 1))

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0,
        background: '#0f0f14',
        zIndex: 50,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center',
        padding: '0 28px',
      }}
    >
      {/* Skip */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', paddingTop: 60 }}>
        <button
          onClick={finish}
          style={{
            fontSize: 14, fontWeight: 600, color: '#6b6b88',
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '8px 4px', fontFamily: 'inherit',
          }}
        >
          ข้าม
        </button>
      </div>

      {/* Slide */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.22 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 24, width: '100%' }}
          >
            {/* Icon */}
            <div style={{
              width: 100, height: 100, borderRadius: 28,
              background: slide.bg,
              border: `1px solid ${slide.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 44,
            }}>
              {slide.emoji}
            </div>

            {/* Text */}
            <div>
              <h2 style={{ fontSize: 26, fontWeight: 800, color: '#f0f0f8', marginBottom: 12 }}>
                {slide.title}
              </h2>
              <p style={{ fontSize: 16, color: '#6b6b88', lineHeight: 1.6, maxWidth: 280 }}>
                {slide.desc}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom */}
      <div style={{ width: '100%', paddingBottom: 52, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
        {/* Dots */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {SLIDES.map((_, i) => (
            <motion.div
              key={i}
              animate={{
                width: i === step ? 24 : 8,
                background: i === step ? slide.color : '#3b3b50',
              }}
              transition={{ duration: 0.25 }}
              style={{ height: 8, borderRadius: 99 }}
            />
          ))}
        </div>

        {/* Button */}
        <button
          onClick={next}
          style={{
            width: '100%', height: 56, borderRadius: 16,
            background: slide.color,
            border: 'none',
            color: '#fff',
            fontSize: 17, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: `0 4px 24px ${slide.color}40`,
            transition: 'all 0.2s',
          }}
        >
          {isLast ? 'เริ่มใช้งาน 🚀' : 'ถัดไป'}
        </button>
      </div>
    </motion.div>
  )
}
