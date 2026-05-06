const DAY_MS = 24 * 60 * 60 * 1000

function toDate(value) {
  if (!value) return null
  const date = value instanceof Date ? new Date(value) : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function startOfDay(value = new Date()) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate())
}

function getLastDayOfMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function getSubscriptionAnchor(sub, fallbackDate = null) {
  const fallback = toDate(fallbackDate) || toDate(sub?.nextBillingDate)
  return {
    day: sub?.billingAnchorDay || fallback?.getDate() || 1,
    month: sub?.billingAnchorMonth ?? fallback?.getMonth() ?? 0,
  }
}

function addBillingCycle(date, cycle, anchor = {}) {
  const source = toDate(date)
  if (!source) return null

  const anchorDay = anchor.day || source.getDate()
  const anchorMonth = anchor.month ?? source.getMonth()
  const hours = source.getHours()
  const minutes = source.getMinutes()
  const seconds = source.getSeconds()
  const ms = source.getMilliseconds()

  if (cycle === 'yearly') {
    const targetYear = source.getFullYear() + 1
    const targetMonth = anchorMonth
    const targetDay = Math.min(anchorDay, getLastDayOfMonth(targetYear, targetMonth))
    return new Date(targetYear, targetMonth, targetDay, hours, minutes, seconds, ms)
  }

  const targetMonthIndex = source.getMonth() + 1
  const targetYear = source.getFullYear() + Math.floor(targetMonthIndex / 12)
  const targetMonth = ((targetMonthIndex % 12) + 12) % 12
  const targetDay = Math.min(anchorDay, getLastDayOfMonth(targetYear, targetMonth))
  return new Date(targetYear, targetMonth, targetDay, hours, minutes, seconds, ms)
}

function subtractBillingCycle(date, cycle, anchor = {}) {
  const source = toDate(date)
  if (!source) return null

  const anchorDay = anchor.day || source.getDate()
  const anchorMonth = anchor.month ?? source.getMonth()
  const hours = source.getHours()
  const minutes = source.getMinutes()
  const seconds = source.getSeconds()
  const ms = source.getMilliseconds()

  if (cycle === 'yearly') {
    const targetYear = source.getFullYear() - 1
    const targetMonth = anchorMonth
    const targetDay = Math.min(anchorDay, getLastDayOfMonth(targetYear, targetMonth))
    return new Date(targetYear, targetMonth, targetDay, hours, minutes, seconds, ms)
  }

  const targetMonthIndex = source.getMonth() - 1
  const targetYear = source.getFullYear() + Math.floor(targetMonthIndex / 12)
  const targetMonth = ((targetMonthIndex % 12) + 12) % 12
  const targetDay = Math.min(anchorDay, getLastDayOfMonth(targetYear, targetMonth))
  return new Date(targetYear, targetMonth, targetDay, hours, minutes, seconds, ms)
}

export function getSubscriptionPaymentMode(sub) {
  if (sub?.paymentMode === 'manual' || sub?.paymentMode === 'auto') return sub.paymentMode
  return sub?.billingCycle === 'manual' ? 'manual' : 'auto'
}

export function getSubscriptionBillingCycle(sub) {
  return sub?.billingCycle === 'yearly' ? 'yearly' : 'monthly'
}

export function getSubscriptionMonthlyAmount(sub) {
  const amount = Number(sub?.amount) || 0
  return getSubscriptionBillingCycle(sub) === 'yearly' ? amount / 12 : amount
}

export function advanceSubscriptionToNextCycle(sub, paidAt = new Date()) {
  const baseDate = toDate(sub?.nextBillingDate) || toDate(paidAt)
  if (!baseDate) return null
  const next = addBillingCycle(
    baseDate,
    getSubscriptionBillingCycle(sub),
    getSubscriptionAnchor(sub, baseDate),
  )
  return next?.toISOString() || null
}

export function rewindSubscriptionToPreviousCycle(sub) {
  const baseDate = toDate(sub?.nextBillingDate)
  if (!baseDate) return null
  const previous = subtractBillingCycle(
    baseDate,
    getSubscriptionBillingCycle(sub),
    getSubscriptionAnchor(sub, baseDate),
  )
  return previous?.toISOString() || null
}

export function getEffectiveNextBillingDate(sub, now = new Date()) {
  const rawDate = toDate(sub?.nextBillingDate)
  if (!rawDate) return null

  if (sub?.status === 'cancelled') return rawDate.toISOString()

  let next = new Date(rawDate)
  const anchor = getSubscriptionAnchor(sub, rawDate)
  if (getSubscriptionPaymentMode(sub) === 'auto') {
    const today = startOfDay(now)
    while (startOfDay(next) < today) {
      next = addBillingCycle(next, getSubscriptionBillingCycle(sub), anchor)
    }
  }

  return next.toISOString()
}

export function getSubscriptionDaysUntil(sub, now = new Date()) {
  const nextBillingDate = getEffectiveNextBillingDate(sub, now)
  const due = toDate(nextBillingDate)
  if (!due) return null
  const dueDay = startOfDay(due)
  const nowDay = startOfDay(now)
  return Math.round((dueDay - nowDay) / DAY_MS)
}

export function canMarkSubscriptionPaid(sub, now = new Date()) {
  if (getSubscriptionPaymentMode(sub) !== 'manual') return false
  if (sub?.status === 'cancelled') return false
  if (!getEffectiveNextBillingDate(sub, now)) return false

  const days = getSubscriptionDaysUntil(sub, now)
  return days !== null && days <= 0
}

export function getManualSubscriptionPaidState(sub, now = new Date()) {
  if (getSubscriptionPaymentMode(sub) !== 'manual') {
    return { isPaidThisCycle: false, isUndoable: false, label: '' }
  }

  const nextBillingDate = toDate(getEffectiveNextBillingDate(sub, now))
  const lastPaidAt = toDate(sub?.lastPaidAt)
  if (!nextBillingDate || !lastPaidAt) {
    return { isPaidThisCycle: false, isUndoable: false, label: '' }
  }

  const nowDay = startOfDay(now)
  const nextDay = startOfDay(nextBillingDate)
  if (nowDay >= nextDay) {
    return { isPaidThisCycle: false, isUndoable: false, label: '' }
  }

  const previousCycleStart = subtractBillingCycle(
    nextBillingDate,
    getSubscriptionBillingCycle(sub),
    getSubscriptionAnchor(sub, nextBillingDate),
  )
  if (lastPaidAt < previousCycleStart || lastPaidAt >= nextBillingDate) {
    return { isPaidThisCycle: false, isUndoable: false, label: '' }
  }

  return {
    isPaidThisCycle: true,
    isUndoable: sameDay(lastPaidAt, now),
    label: sameDay(lastPaidAt, now) ? 'จ่ายแล้ววันนี้' : 'จ่ายแล้ว',
  }
}

export function getSubscriptionTimeline(sub, now = new Date()) {
  const paymentMode = getSubscriptionPaymentMode(sub)
  const billingCycle = getSubscriptionBillingCycle(sub)
  const nextBillingDate = getEffectiveNextBillingDate(sub, now)
  const days = getSubscriptionDaysUntil(sub, now)
  const isManual = paymentMode === 'manual'
  const isUrgent = days !== null && days >= 0 && days <= 3
  const isOverdue = isManual && days !== null && days < 0

  let shortLabel = ''
  if (days !== null) {
    if (isManual) {
      shortLabel =
        days < 0
          ? `ค้างจ่าย ${Math.abs(days)} วัน`
          : days === 0
          ? 'ต้องจ่ายวันนี้'
          : days === 1
          ? 'จ่ายพรุ่งนี้'
          : `จ่ายอีก ${days} วัน`
    } else {
      shortLabel =
        days === 0
          ? 'ตัดวันนี้'
          : days === 1
          ? 'ตัดพรุ่งนี้'
          : `ตัดอีก ${days} วัน`
    }
  }

  return {
    paymentMode,
    billingCycle,
    nextBillingDate,
    days,
    isManual,
    isUrgent,
    isOverdue,
    shortLabel,
  }
}

export function normalizeSubscription(sub, now = new Date()) {
  if (!sub) return sub

  const paymentMode = getSubscriptionPaymentMode(sub)
  const billingCycle = getSubscriptionBillingCycle(sub)
  const anchor = getSubscriptionAnchor(sub)
  const nextBillingDate = sub.nextBillingDate
    ? getEffectiveNextBillingDate({ ...sub, paymentMode, billingCycle }, now)
    : null

  return {
    ...sub,
    paymentMode,
    billingCycle,
    billingAnchorDay: anchor.day,
    billingAnchorMonth: anchor.month,
    nextBillingDate,
  }
}

export function normalizeSubscriptions(subscriptions, now = new Date()) {
  return (subscriptions || []).map((sub) => normalizeSubscription(sub, now))
}
