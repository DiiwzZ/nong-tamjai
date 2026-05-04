import { savePushSub, removePushSub } from './db'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY

/* ── urlBase64 → Uint8Array (required by PushManager.subscribe) ── */
function urlB64ToUint8Array(b64) {
  const pad  = '='.repeat((4 - (b64.length % 4)) % 4)
  const base = (b64 + pad).replace(/-/g, '+').replace(/_/g, '/')
  const raw  = atob(base)
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)))
}

/* ── Register service worker ── */
export async function registerSW() {
  if (!('serviceWorker' in navigator)) return false
  try {
    await navigator.serviceWorker.register('/sw.js')
    return true
  } catch {
    return false
  }
}

/* ── Request Notification permission ── */
export async function requestPermission() {
  if (!('Notification' in window)) return 'unsupported'
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'
  return Notification.requestPermission()
}

/* ── Subscribe to Web Push + save to Firestore ── */
export async function subscribeToPush(uid) {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return { ok: false, reason: 'unsupported' }
  }
  if (!VAPID_PUBLIC_KEY) {
    return { ok: false, reason: 'no-vapid-key' }
  }

  try {
    const reg = await navigator.serviceWorker.ready
    // Reuse existing subscription or create new one
    let sub = await reg.pushManager.getSubscription()
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlB64ToUint8Array(VAPID_PUBLIC_KEY),
      })
    }

    const json = sub.toJSON()
    await savePushSub(uid, {
      endpoint: json.endpoint,
      p256dh:   json.keys.p256dh,
      auth:     json.keys.auth,
    })

    return { ok: true }
  } catch (err) {
    console.error('Push subscribe failed:', err)
    return { ok: false, reason: err.message }
  }
}

/* ── Unsubscribe from Web Push ── */
export async function unsubscribeFromPush(uid) {
  try {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    if (sub) await sub.unsubscribe()
    if (uid) await removePushSub(uid)
  } catch (err) {
    console.error('Push unsubscribe failed:', err)
  }
}

/* ── Local (in-app) scheduled notifications — fallback when app is open ── */
export function scheduleLocalNotification(title, body, fireAt) {
  const delay = new Date(fireAt) - Date.now()
  if (delay <= 0) return
  setTimeout(() => {
    if (Notification.permission !== 'granted') return
    new Notification(title, {
      body,
      icon:  '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
    })
  }, delay)
}

export function scheduleTaskReminder(task) {
  if (!task.dueDate) return
  const fireAt = new Date(task.dueDate)
  fireAt.setHours(fireAt.getHours() - 1)
  scheduleLocalNotification(
    `⏰ ${task.title}`,
    `ครบกำหนดใน 1 ชั่วโมง`,
    fireAt
  )
}

export function scheduleSubReminder(sub) {
  if (!sub.nextBillingDate || !sub.alertDays) return
  const fireAt = new Date(sub.nextBillingDate)
  fireAt.setDate(fireAt.getDate() - sub.alertDays)
  fireAt.setHours(9, 0, 0, 0)
  scheduleLocalNotification(
    `💳 จ่าย ${sub.name} ใน ${sub.alertDays} วัน`,
    `฿${sub.amount.toLocaleString()} — ${new Date(sub.nextBillingDate).toLocaleDateString('th-TH')}`,
    fireAt
  )
}
