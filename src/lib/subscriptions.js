const DAY_MS = 24 * 60 * 60 * 1000

function toDate(value) {
  if (!value) return null
  const date = value instanceof Date ? new Date(value) : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function startOfDay(value = new Date()) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate())
}

function addBillingCycle(date, cycle) {
  const next = new Date(date)
  if (cycle === 'yearly') next.setFullYear(next.getFullYear() + 1)
  else next.setMonth(next.getMonth() + 1)
  return next
}

function subtractBillingCycle(date, cycle) {
  const previous = new Date(date)
  if (cycle === 'yearly') previous.setFullYear(previous.getFullYear() - 1)
  else previous.setMonth(previous.getMonth() - 1)
  return previous
}

function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function advanceSubscriptionToNextCycle(sub, paidAt = new Date()) {
  const baseDate = toDate(sub?.nextBillingDate) || toDate(paidAt)
  if (!baseDate) return null
  return addBillingCycle(baseDate, getSubscriptionBillingCycle(sub)).toISOString()
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

export function getEffectiveNextBillingDate(sub, now = new Date()) {
  const rawDate = toDate(sub?.nextBillingDate)
  if (!rawDate) return null

  if (sub?.status === 'cancelled') return rawDate.toISOString()

  let next = new Date(rawDate)
  if (getSubscriptionPaymentMode(sub) === 'auto') {
    const today = startOfDay(now)
    while (startOfDay(next) < today) {
      next = addBillingCycle(next, getSubscriptionBillingCycle(sub))
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
    return { isPaidThisCycle: false, label: '' }
  }

  const nextBillingDate = toDate(getEffectiveNextBillingDate(sub, now))
  const lastPaidAt = toDate(sub?.lastPaidAt)
  if (!nextBillingDate || !lastPaidAt) {
    return { isPaidThisCycle: false, label: '' }
  }

  const nowDay = startOfDay(now)
  const nextDay = startOfDay(nextBillingDate)
  if (nowDay >= nextDay) {
    return { isPaidThisCycle: false, label: '' }
  }

  const previousCycleStart = subtractBillingCycle(nextBillingDate, getSubscriptionBillingCycle(sub))
  if (lastPaidAt < previousCycleStart || lastPaidAt >= nextBillingDate) {
    return { isPaidThisCycle: false, label: '' }
  }

  return {
    isPaidThisCycle: true,
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
  const nextBillingDate = sub.nextBillingDate
    ? getEffectiveNextBillingDate({ ...sub, paymentMode, billingCycle }, now)
    : null

  return {
    ...sub,
    paymentMode,
    billingCycle,
    nextBillingDate,
  }
}

export function normalizeSubscriptions(subscriptions, now = new Date()) {
  return (subscriptions || []).map((sub) => normalizeSubscription(sub, now))
}
