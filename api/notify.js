/**
 * Vercel Serverless Function — Web Push cron
 * Schedule: runs daily at 08:00 ICT (01:00 UTC) via vercel.json crons
 */

const webpush = require('web-push')
const { initializeApp, getApps, cert } = require('firebase-admin/app')
const { getFirestore } = require('firebase-admin/firestore')

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
  // Allow GET (browser/cron test) or authenticated POST
  if (
    req.method !== 'GET' &&
    req.headers['authorization'] !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  /* ── Check env vars ── */
  const { FIREBASE_SERVICE_ACCOUNT, VITE_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_EMAIL } = process.env
  if (!FIREBASE_SERVICE_ACCOUNT || !VITE_VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY || !VAPID_EMAIL) {
    const missing = [
      !FIREBASE_SERVICE_ACCOUNT && 'FIREBASE_SERVICE_ACCOUNT',
      !VITE_VAPID_PUBLIC_KEY    && 'VITE_VAPID_PUBLIC_KEY',
      !VAPID_PRIVATE_KEY        && 'VAPID_PRIVATE_KEY',
      !VAPID_EMAIL              && 'VAPID_EMAIL',
    ].filter(Boolean)
    return res.status(500).json({ error: 'Missing env vars', missing })
  }

  /* ── Init Firebase Admin (lazy singleton) ── */
  let db
  try {
    if (!getApps().length) {
      initializeApp({ credential: cert(JSON.parse(FIREBASE_SERVICE_ACCOUNT)) })
    }
    db = getFirestore()
  } catch (err) {
    console.error('[notify] Firebase init error:', err.message)
    return res.status(500).json({ error: 'Firebase init failed', detail: err.message })
  }

  /* ── Init web-push (inside handler so env vars are guaranteed) ── */
  try {
    webpush.setVapidDetails(`mailto:${VAPID_EMAIL}`, VITE_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
  } catch (err) {
    console.error('[notify] VAPID init error:', err.message)
    return res.status(500).json({ error: 'VAPID init failed', detail: err.message })
  }

  const now   = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  /* ── Fetch all push subscriptions ── */
  let pushSnap
  try {
    pushSnap = await db.collection('pushSubs').get()
  } catch (err) {
    console.error('[notify] Firestore error:', err.message)
    return res.status(500).json({ error: 'Firestore read failed', detail: err.message })
  }

  if (pushSnap.empty) return res.json({ sent: 0, reason: 'no-subscribers' })

  const results = []

  for (const pushDoc of pushSnap.docs) {
    const { uid, endpoint, p256dh, auth } = pushDoc.data()
    if (!uid || !endpoint || !p256dh || !auth) continue

    const pushSub = { endpoint, keys: { p256dh, auth } }

    /* ── Tasks due today ── */
    try {
      const tasksSnap = await db.collection(`users/${uid}/tasks`).get()
      for (const t of tasksSnap.docs) {
        const task = t.data()
        if (task.status !== 'active' || !task.dueDate) continue

        const dueDate = new Date(task.dueDate)

        if (isWithinHours(task.dueDate, 2)) {
          const mins = Math.round((dueDate - now) / 60000)
          results.push(send(pushSub, { title: `⏰ ${task.title}`, body: `ครบกำหนดใน ${mins} นาที` }))
        } else if (sameDay(dueDate, today) && now.getHours() <= 9) {
          results.push(send(pushSub, {
            title: `📋 ${task.title}`,
            body:  `ครบกำหนดวันนี้ ${dueDate.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}`,
          }))
        }
      }
    } catch (err) {
      console.error(`[notify] tasks fetch error uid=${uid}:`, err.message)
    }

    /* ── Subscriptions billing alert ── */
    try {
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
    } catch (err) {
      console.error(`[notify] subs fetch error uid=${uid}:`, err.message)
    }
  }

  const settled = await Promise.allSettled(results)
  const ok   = settled.filter((r) => r.status === 'fulfilled').length
  const fail = settled.filter((r) => r.status === 'rejected').length

  settled.filter((r) => r.status === 'rejected').forEach((r) => {
    console.error('[notify] push failed:', r.reason?.message)
  })

  console.log(`[notify] sent=${ok} failed=${fail}`)
  return res.json({ sent: ok, failed: fail })
}

/* ── Send helper ── */
async function send(pushSub, payload) {
  return webpush.sendNotification(pushSub, JSON.stringify(payload))
}
