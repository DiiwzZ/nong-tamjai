export async function registerSW() {
  if (!('serviceWorker' in navigator)) return false
  try {
    await navigator.serviceWorker.register('/sw.js')
    return true
  } catch {
    return false
  }
}

export async function requestPermission() {
  if (!('Notification' in window)) return 'unsupported'
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'
  const result = await Notification.requestPermission()
  return result
}

export function scheduleLocalNotification(title, body, fireAt) {
  const delay = new Date(fireAt) - Date.now()
  if (delay <= 0) return
  setTimeout(() => {
    if (Notification.permission !== 'granted') return
    new Notification(title, {
      body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
    })
  }, delay)
}

export function scheduleTaskReminder(task) {
  if (!task.dueDate) return
  const fireAt = new Date(task.dueDate)
  fireAt.setHours(fireAt.getHours() - 1)
  scheduleLocalNotification(
    `Task ใกล้ถึงเวลา: ${task.title}`,
    `Due ${new Date(task.dueDate).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}`,
    fireAt
  )
}

export function scheduleSubReminder(sub) {
  if (!sub.nextBillingDate || !sub.alertDays) return
  const fireAt = new Date(sub.nextBillingDate)
  fireAt.setDate(fireAt.getDate() - sub.alertDays)
  fireAt.setHours(9, 0, 0, 0)
  scheduleLocalNotification(
    `จ่าย ${sub.name} อีก ${sub.alertDays} วัน`,
    `฿${sub.amount.toLocaleString()} — ${new Date(sub.nextBillingDate).toLocaleDateString('th-TH')}`,
    fireAt
  )
}
