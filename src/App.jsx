import { useState, lazy, Suspense } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { StoreProvider, useStore } from '@/store/useStore'
import { BottomNav } from '@/components/layout/BottomNav'
import { Onboarding } from '@/components/Onboarding'
import { NotificationBanner } from '@/components/NotificationBanner'

// Tasks loads eagerly — it's the first tab the user sees
import { Tasks } from '@/pages/Tasks'

// All other pages are lazy — only bundled/loaded when first visited
const Subscriptions = lazy(() => import('@/pages/Subscriptions').then((m) => ({ default: m.Subscriptions })))
const Split        = lazy(() => import('@/pages/Split').then((m) => ({ default: m.Split })))
const Dashboard    = lazy(() => import('@/pages/Dashboard').then((m) => ({ default: m.Dashboard })))
const Archive      = lazy(() => import('@/pages/Archive').then((m) => ({ default: m.Archive })))
const Settings     = lazy(() => import('@/pages/Settings').then((m) => ({ default: m.Settings })))

const PAGES = {
  tasks: Tasks,
  subscriptions: Subscriptions,
  split: Split,
  dashboard: Dashboard,
  archive: Archive,
}

const NAV_TABS = ['tasks', 'subscriptions', 'split', 'dashboard']

/* Pages that show the Settings gear icon */
const SETTINGS_TABS = ['tasks', 'subscriptions', 'split']

function AppInner() {
  const [tab, setTab] = useState('tasks')
  const [settingsOpen, setSettingsOpen] = useState(false)
  const { onboardingDone } = useStore()
  const Page = PAGES[tab]

  const showSettings = SETTINGS_TABS.includes(tab)

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
          <Suspense fallback={null}>
            <Page
              onTabChange={setTab}
              onSettings={showSettings ? () => setSettingsOpen(true) : undefined}
            />
          </Suspense>
        </motion.div>
      </AnimatePresence>

      {/* Bottom nav — hidden on archive page */}
      {NAV_TABS.includes(tab) && (
        <BottomNav active={tab} onChange={setTab} />
      )}

      {onboardingDone && <NotificationBanner />}

      {/* Settings overlay — sits above BottomNav (zIndex 60) */}
      <AnimatePresence>
        {settingsOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 340, damping: 34 }}
            style={{ position: 'absolute', inset: 0, zIndex: 60 }}
          >
            <Suspense fallback={null}>
              <Settings onClose={() => setSettingsOpen(false)} />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
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
