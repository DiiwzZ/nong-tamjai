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
    <div className="relative h-svh overflow-hidden bg-background">
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
