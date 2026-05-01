import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { StoreProvider, useStore } from '@/store/useStore'
import { BottomNav } from '@/components/layout/BottomNav'
import { Onboarding } from '@/components/Onboarding'
import { NotificationBanner } from '@/components/NotificationBanner'
import { Tasks } from '@/pages/Tasks'
import { Subscriptions } from '@/pages/Subscriptions'
import { Dashboard } from '@/pages/Dashboard'

const PAGES = {
  tasks: Tasks,
  subscriptions: Subscriptions,
  dashboard: Dashboard,
}

function AppInner() {
  const [tab, setTab] = useState('tasks')
  const { onboardingDone } = useStore()
  const Page = PAGES[tab]

  return (
    <div className="relative min-h-[calc(100svh-1.8rem)] overflow-hidden rounded-[2rem] border border-white/6 bg-background shadow-[0_30px_80px_-40px_rgba(0,0,0,0.95)]">
      <AnimatePresence>
        {!onboardingDone && <Onboarding />}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          className="absolute inset-0"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          <Page />
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
