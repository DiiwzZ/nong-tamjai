import assert from 'node:assert/strict'

import {
  advanceSubscriptionToNextCycle,
  canMarkSubscriptionPaid,
  getEffectiveNextBillingDate,
  getManualSubscriptionPaidState,
  normalizeSubscription,
  rewindSubscriptionToPreviousCycle,
} from '../src/lib/subscriptions.js'

function localIso(year, monthIndex, day, hour = 12, minute = 0, second = 0) {
  return new Date(year, monthIndex, day, hour, minute, second).toISOString()
}

function toYmd(value) {
  const date = new Date(value)
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  }
}

function assertYmd(actualIso, year, month, day, label) {
  const actual = toYmd(actualIso)
  assert.deepEqual(actual, { year, month, day }, label)
}

function runCase(label, fn) {
  fn()
  console.log(`PASS ${label}`)
}

runCase('monthly anchor keeps 31st across short months', () => {
  const january31 = normalizeSubscription({
    billingCycle: 'monthly',
    paymentMode: 'manual',
    nextBillingDate: localIso(2026, 0, 31),
  })

  const february = advanceSubscriptionToNextCycle(january31, localIso(2026, 0, 31))
  assertYmd(february, 2026, 2, 28, 'January 31 should roll to February 28 in 2026')

  const march = advanceSubscriptionToNextCycle(
    { ...january31, nextBillingDate: february },
    localIso(2026, 1, 28),
  )
  assertYmd(march, 2026, 3, 31, 'February should return to the anchored 31st in March')
})

runCase('yearly anchor keeps leap-day subscriptions on valid fallback dates', () => {
  const leapDay = normalizeSubscription({
    billingCycle: 'yearly',
    paymentMode: 'manual',
    nextBillingDate: localIso(2024, 1, 29),
  })

  const nextYear = advanceSubscriptionToNextCycle(leapDay, localIso(2024, 1, 29))
  assertYmd(nextYear, 2025, 2, 28, 'Leap-day yearly plan should fall back to February 28')

  const rewind = rewindSubscriptionToPreviousCycle({ ...leapDay, nextBillingDate: nextYear })
  assertYmd(rewind, 2024, 2, 29, 'Rewind should recover the original leap day when possible')
})

runCase('manual subscriptions can only be marked paid when due or overdue', () => {
  const dueToday = normalizeSubscription({
    billingCycle: 'monthly',
    paymentMode: 'manual',
    nextBillingDate: localIso(2026, 4, 6),
  })
  const future = normalizeSubscription({
    billingCycle: 'monthly',
    paymentMode: 'manual',
    nextBillingDate: localIso(2026, 4, 9),
  })

  assert.equal(
    canMarkSubscriptionPaid(dueToday, new Date(localIso(2026, 4, 6))),
    true,
    'Manual plan due today should be markable',
  )
  assert.equal(
    canMarkSubscriptionPaid(future, new Date(localIso(2026, 4, 6))),
    false,
    'Manual plan in the future should not be markable',
  )
})

runCase('paid-state is undoable only on the same day the payment was marked', () => {
  const afterPay = normalizeSubscription({
    billingCycle: 'monthly',
    paymentMode: 'manual',
    nextBillingDate: localIso(2026, 5, 6),
    lastPaidAt: localIso(2026, 4, 6),
  })

  const sameDayState = getManualSubscriptionPaidState(afterPay, new Date(localIso(2026, 4, 6)))
  assert.equal(sameDayState.isPaidThisCycle, true, 'Paid state should be active for the current cycle')
  assert.equal(sameDayState.isUndoable, true, 'Same-day payment should be undoable')

  const nextDayState = getManualSubscriptionPaidState(afterPay, new Date(localIso(2026, 4, 7)))
  assert.equal(nextDayState.isPaidThisCycle, true, 'Paid state should still be visible next day')
  assert.equal(nextDayState.isUndoable, false, 'Undo should expire after the payment day')
})

runCase('auto subscriptions roll forward to the next valid billing cycle', () => {
  const autoPastDue = normalizeSubscription(
    {
      billingCycle: 'monthly',
      paymentMode: 'auto',
      nextBillingDate: localIso(2026, 3, 30),
    },
    new Date(localIso(2026, 4, 6)),
  )

  const effective = getEffectiveNextBillingDate(autoPastDue, new Date(localIso(2026, 4, 6)))
  assertYmd(effective, 2026, 5, 30, 'Auto plan should skip forward to the next future billing date')
})

console.log('All billing logic checks passed.')
