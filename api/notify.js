/**
 * Vercel Serverless Function — Web Push cron
 * Schedule: runs daily at 08:00 ICT (01:00 UTC) via vercel.json crons
 *
 * What it does:
 *   1. Reads all push subscriptions from Firestore /pushSubs
 *   2. For each user → checks tasks due today + subs with alertDays matching today
 *   3. Sends Web Push via Apple APNs (via web-push library)
 *
 * Required env vars in Vercel dashboard:
 *   VITE_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_EMAIL
 *   FIREBASE_SERVICE_ACCOUNT  (stringified service account JSON)
 */

const webpush    = require('web-push')
const { initializeApp, getApps, cert } = require('firebase-admin/app')
const { getFirestore } = require('firebase-admin/firestore')

/* ── Init Firebase Admin (singleton) ── */
function getAdminDb() {
  if (!getApps().length) {
    initializeApp({
      credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)),
    })
  }
  return getFirestore()
}

/* ── Init web-push ── */
webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL}`,
  process.env.VITE_VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)

/* ── Helpers ── */
function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth()    &&
    a.getDate()     === b.getDate()
  )
}

function isWithinHours(dateStr, hours) {
  const due  = new Date(dateStr)
  const now  = new Date()
  const diff = due - now
  return diff >= 0 && diff <= hours * 60 * 60 * 1000
}

/* ── Main handler ── */
module.exports = async function handler(req, res) {
  // Vercel automatically injects Authorization header for cron requests
  // On Hobby plan cron doesn't send auth — allow GET from Vercel infra
  if (
    req.method !== 'GET' &&
    req.headers['authorization'] !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const db  = getAdminDb()
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  /* ── Fetch all push subscriptions ── */
  const pushSnap = await db.collection('pushSubs').get()
  if (pushSnap.empty) return res.json({ sent: 0, reason: 'no-subscribers' })

  const results = []

  for (const pushDoc of pushSnap.docs) {
    const { uid, endpoint, p256dh, auth } = pushDoc.data()
    if (!uid || !endpoint || !p256dh || !auth) continue

    const pushSub = { endpoint, keys: { p256dh, auth } }

    /* ── Check tasks due today ── */
    const tasksSnap = await db.collection(`users/${uid}/tasks`).get()
    for (const t of tasksSnap.docs) {
      const task = t.data()
      if (task.status !== 'active' || !task.dueDate) continue

      const dueDate = new Date(task.dueDate)

      // Notify if task is due within next 2 hours
      if (isWithinHours(task.dueDate, 2)) {
        const mins = Math.round((dueDate - now) / 60000)
        results.push(send(pushSub, {
          title: `⏰ ${task.title}`,
          body:  `ครบกำหนดใน ${mins} นาที`,
        }))
      }

      // Notify if task is due today (morning reminder)
      else if (sameDay(dueDate, today) && now.getHours() <= 9) {
        results.push(send(pushSub, {
          title: `📋 ${task.title}`,
          body:  `ครบกำหนดวันนี้ ${dueDate.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}`,
        }))
      }
    }

    /* ── Check subscriptions needing payment alert ── */
    const subsSnap = await db.collection(`users/${uid}/subscriptions`).get()
    for (const s of subsSnap.docs) {
      const sub = s.data()
      if (!sub.nextBillingDate || sub.status === 'cancelled') continue

      const dueDate  = new Date(sub.nextBillingDate)
      const alertDay = new Date(dueDate)
      alertDay.setDate(alertDay.getDate() - (sub.alertDays ?? 3))

      if (sameDay(alertDay, today)) {
        const daysLeft = Math.round((dueDate - today) / 86400000)
        results.push(send(pushSub, {
          title: `💳 ${sub.name}`,
          body:  daysLeft === 0
            ? `ครบกำหนดจ่ายวันนี้ ฿${sub.amount.toLocaleString()}`
            : `จ่ายอีก ${daysLeft} วัน — ฿${sub.amount.toLocaleString()}`,
        }))
      }
    }
  }

  const sent = await Promise.allSettled(results)
  const ok   = sent.filter((r) => r.status === 'fulfilled').length
  const fail = sent.filter((r) => r.status === 'rejected').length

  console.log(`[notify] sent=${ok} failed=${fail}`)
  return res.json({ sent: ok, failed: fail })
}

/* ── Send helper ── */
async function send(pushSub, payload) {
  return webpush.sendNotification(pushSub, JSON.stringify(payload))
}
