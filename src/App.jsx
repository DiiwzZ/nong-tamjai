import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { StoreProvider, useStore } from '@/store/useStore'
import { BottomNav } from '@/components/layout/BottomNav'
import { Onboarding } from '@/components/Onboarding'
import { NotificationBanner } from '@/components/NotificationBanner'
import { Tasks } from '@/pages/Tasks'
import { Subscriptions } from '@/pages/Subscriptions'
import { Dashboard } from '@/pages/Dashboard'
import { cn } from '@/lib/utils'

const PAGES = {
  tasks: Tasks,
  subscriptions: Subscriptions,
  dashboard: Dashboard,
}

const isStandalone =
  (typeof window !== 'undefined' && window.navigator.standalone === true) ||
  (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches)

function AppInner() {
  const [tab, setTab] = useState('tasks')
  const { onboardingDone } = useStore()
  const Page = PAGES[tab]

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-background',
        isStandalone
          ? 'h-svh'
          : 'min-h-[calc(100svh-2.2rem)] rounded-[2.45rem] border border-white/8 shadow-[0_36px_100px_-46px_rgba(0,0,0,1)]'
      )}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-60 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.2),transparent_74%)]" />
        <div className="absolute -right-16 top-28 h-44 w-44 rounded-full bg-primary/12 blur-3xl" />
        <div className="absolute -left-10 bottom-24 h-36 w-36 rounded-full bg-white/[0.04] blur-3xl" />
        {!isStandalone && (
          <div className="absolute inset-[1px] rounded-[2.35rem] border border-white/[0.04]" />
        )}
      </div>

      <AnimatePresence>
        {!onboardingDone && <Onboarding />}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          className="absolute inset-0 z-10"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          <Page onTabChange={setTab} />
        </motion.div>
      </AnimatePresence>

      <BottomNav active={tab} onChange={setTab} />
      {onboardingDone && <NotificationBanner />}
    </div>
  )
}

function App() {
  return (
    <StoreProvider>
      <AppInner />
    </StoreProvider>
  )
}

export default App
