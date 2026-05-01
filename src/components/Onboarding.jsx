import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { CheckSquare, CreditCard, Bell, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useStore } from '@/store/useStore'

const SLIDES = [
  {
    icon: CheckSquare,
    color: 'bg-blue-500',
    title: 'จัดการ Task',
    desc: 'เพิ่ม task พร้อม priority, หมวดหมู่ และ due date แบ่งตามวันให้เห็นภาพรวมชัดเจน',
  },
  {
    icon: CreditCard,
    color: 'bg-purple-500',
    title: 'ติดตาม Subscription',
    desc: 'บันทึก subscription ทุกรายการ รู้ว่าเดือนนี้จ่ายอะไรบ้าง และจ่ายรวมเท่าไหร่',
  },
  {
    icon: Bell,
    color: 'bg-orange-500',
    title: 'แจ้งเตือนล่วงหน้า',
    desc: 'ตั้งให้แจ้งเตือนก่อนถึงวันจ่าย subscription และ task ที่ใกล้ due date',
  },
]

export function Onboarding() {
  const { update } = useStore()
  const [step, setStep] = useState(0)

  const isLast = step === SLIDES.length - 1
  const slide = SLIDES[step]
  const Icon = slide.icon

  const finish = () => update({ onboardingDone: true })

  return (
    <div
      className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-between px-8"
      style={{
        paddingTop:    'max(4rem, calc(env(safe-area-inset-top, 0px) + 1.5rem))',
        paddingBottom: 'max(2.5rem, calc(env(safe-area-inset-bottom, 0px) + 1.5rem))',
      }}
    >
      {/* Skip */}
      <button
        onClick={finish}
        className="self-end text-sm text-muted-foreground"
      >
        ข้าม
      </button>

      {/* Slide content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col items-center text-center gap-6"
        >
          <div className={`w-24 h-24 rounded-3xl ${slide.color} flex items-center justify-center shadow-lg`}>
            <Icon size={44} className="text-white" strokeWidth={1.8} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-3">{slide.title}</h2>
            <p className="text-muted-foreground leading-relaxed">{slide.desc}</p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Bottom */}
      <div className="w-full flex flex-col items-center gap-6">
        {/* Dots */}
        <div className="flex gap-2">
          {SLIDES.map((_, i) => (
            <motion.div
              key={i}
              animate={{ width: i === step ? 24 : 8, opacity: i === step ? 1 : 0.3 }}
              className="h-2 rounded-full bg-primary"
            />
          ))}
        </div>

        <Button
          className="w-full"
          onClick={() => (isLast ? finish() : setStep((s) => s + 1))}
        >
          {isLast ? 'เริ่มใช้งาน' : 'ถัดไป'}
          {!isLast && <ChevronRight size={18} />}
        </Button>
      </div>
    </div>
  )
}
