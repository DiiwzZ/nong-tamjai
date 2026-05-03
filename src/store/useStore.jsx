import { useState, useEffect, createContext, useContext } from 'react'
import { DEFAULT_CATEGORIES } from '@/lib/utils'
import { scheduleTaskReminder, scheduleSubReminder } from '@/lib/notifications'
import { signInAnon, onAuthReady } from '@/lib/firebase'
import { fetchTasks, saveTask, removeTask, fetchSubs, saveSub, removeSub } from '@/lib/db'

const StoreContext = createContext(null)
const STORAGE_KEY = 'myflow_data'

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function saveToStorage(data) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) } catch {
    // Ignore storage write failures, e.g. private mode or quota limits.
  }
}

const initialState = {
  tasks: [],
  subscriptions: [],
  categories: DEFAULT_CATEGORIES,
  userName: '',
  darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
  onboardingDone: false,
}

export function StoreProvider({ children }) {
  const [state, setState] = useState(() => {
    const saved = loadFromStorage()
    return saved ? { ...initialState, ...saved } : initialState
  })
  const [uid, setUid] = useState(null)

  // Dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', state.darkMode)
  }, [state.darkMode])

  // Persist to localStorage
  useEffect(() => { saveToStorage(state) }, [state])

  // Firebase: sign in anonymously → load Firestore data
  useEffect(() => {
    signInAnon().catch(console.error)
    const unsub = onAuthReady(async (user) => {
      if (!user) return
      setUid(user.uid)
      try {
        const [tasks, subscriptions] = await Promise.all([
          fetchTasks(user.uid),
          fetchSubs(user.uid),
        ])
        // Firestore wins — overwrite local state with cloud data
        setState((s) => ({ ...s, tasks, subscriptions }))
      } catch (err) {
        console.error('Firestore fetch failed, using localStorage:', err)
      }
    })
    return unsub
  }, [])

  const update = (patch) => setState((s) => ({ ...s, ...patch }))

  // --- Tasks ---

  const addTask = (task) => {
    const newTask = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      status: 'active',
      ...task,
    }
    update({ tasks: [...state.tasks, newTask] })
    if (uid) saveTask(uid, newTask).catch(console.error)
    scheduleTaskReminder(newTask)
  }

  const updateTask = (id, patch) => {
    const tasks = state.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t))
    update({ tasks })
    if (uid) {
      const task = tasks.find((t) => t.id === id)
      if (task) saveTask(uid, task).catch(console.error)
    }
  }

  const deleteTask = (id) => {
    update({ tasks: state.tasks.filter((t) => t.id !== id) })
    if (uid) removeTask(uid, id).catch(console.error)
  }

  const completeTask = (id) =>
    updateTask(id, { status: 'completed', completedAt: new Date().toISOString() })

  const uncompleteTask = (id) =>
    updateTask(id, { status: 'active', completedAt: null })

  const toggleTaskComplete = (id) => {
    const task = state.tasks.find((t) => t.id === id)
    if (!task) return
    if (task.status === 'completed') {
      uncompleteTask(id)
      return
    }
    completeTask(id)
  }

  const archiveTask = (id) => updateTask(id, { status: 'archived' })

  const clearArchive = () => {
    const toDelete = state.tasks.filter(
      (t) => t.status === 'completed' || t.status === 'archived',
    )
    update({ tasks: state.tasks.filter((t) => t.status !== 'completed' && t.status !== 'archived') })
    if (uid) toDelete.forEach((t) => removeTask(uid, t.id).catch(console.error))
  }

  // --- Subscriptions ---

  const addSubscription = (sub) => {
    const newSub = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      status: 'active',
      currency: 'THB',
      ...sub,
    }
    update({ subscriptions: [...state.subscriptions, newSub] })
    if (uid) saveSub(uid, newSub).catch(console.error)
    scheduleSubReminder(newSub)
  }

  const updateSubscription = (id, patch) => {
    const subscriptions = state.subscriptions.map((s) =>
      s.id === id ? { ...s, ...patch } : s
    )
    update({ subscriptions })
    if (uid) {
      const sub = subscriptions.find((s) => s.id === id)
      if (sub) saveSub(uid, sub).catch(console.error)
    }
  }

  const deleteSubscription = (id) => {
    update({ subscriptions: state.subscriptions.filter((s) => s.id !== id) })
    if (uid) removeSub(uid, id).catch(console.error)
  }

  // --- Categories ---

  const addCategory = (cat) =>
    update({ categories: [...state.categories, { id: crypto.randomUUID(), ...cat }] })

  const updateCategory = (id, patch) =>
    update({ categories: state.categories.map((c) => c.id === id ? { ...c, ...patch } : c) })

  const deleteCategory = (id) =>
    update({ categories: state.categories.filter((c) => c.id !== id) })

  // --- Data ---

  const clearAllData = () => {
    if (uid) {
      state.tasks.forEach((t) => removeTask(uid, t.id).catch(console.error))
      state.subscriptions.forEach((s) => removeSub(uid, s.id).catch(console.error))
    }
    update({ tasks: [], subscriptions: [], categories: DEFAULT_CATEGORIES, userName: '' })
  }

  // --- Profile ---

  const setUserName = (name) => update({ userName: name.trim() })

  // --- Split ---

  const markSplitPaid = (subId, memberId, paid = true) => {
    const subscriptions = state.subscriptions.map((s) => {
      if (s.id !== subId || !s.split) return s
      return {
        ...s,
        split: {
          ...s.split,
          members: s.split.members.map((m) =>
            m.id === memberId
              ? { ...m, paid, paidAt: paid ? new Date().toISOString() : null }
              : m
          ),
        },
      }
    })
    update({ subscriptions })
    if (uid) {
      const sub = subscriptions.find((s) => s.id === subId)
      if (sub) saveSub(uid, sub).catch(console.error)
    }
  }

  const value = {
    ...state,
    uid,
    update,
    addTask, updateTask, deleteTask, completeTask, uncompleteTask, toggleTaskComplete, archiveTask, clearArchive,
    addSubscription, updateSubscription, deleteSubscription,
    addCategory,
    setUserName,
    markSplitPaid,
    addCategory, updateCategory, deleteCategory,
    clearAllData,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
