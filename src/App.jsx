import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { StoreProvider, useStore } from '@/store/useStore'
import { BottomNav } from '@/components/layout/BottomNav'
import { Onboarding } from '@/components/Onboarding'
import { NotificationBanner } from '@/components/NotificationBanner'
import { Tasks } from '@/pages/Tasks'
import { Subscriptions } from '@/pages/Subscriptions'
import { Split } from '@/pages/Split'
import { Dashboard } from '@/pages/Dashboard'
import { Archive } from '@/pages/Archive'

const PAGES = {
  tasks: Tasks,
  subscriptions: Subscriptions,
  split: Split,
  dashboard: Dashboard,
  archive: Archive,
}

const NAV_TABS = ['tasks', 'subscriptions', 'split', 'dashboard']

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
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <Page onTabChange={setTab} />
        </motion.div>
      </AnimatePresence>

      {/* Bottom nav — hidden on archive page */}
      {NAV_TABS.includes(tab) && (
        <BottomNav active={tab} onChange={setTab} />
      )}

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
