import { useMemo } from 'react'
import { DayPicker } from 'react-day-picker'
import { formatCurrency } from '@/lib/utils'

const dayPickerStyle = `
  .rdp { --rdp-accent-color: var(--color-primary); margin: 0; }
  .rdp-month { width: 100%; }
  .rdp-table { width: 100%; }
  .rdp-head_cell { font-size: 11px; font-weight: 600; color: var(--color-muted-foreground); padding-bottom: 8px; }
  .rdp-cell { padding: 2px; }
  .rdp-button { width: 36px; height: 36px; border-radius: 10px; font-size: 13px; color: var(--color-foreground); }
  .rdp-button:hover { background: var(--color-accent); }
  .rdp-day_selected .rdp-button { background: var(--color-primary) !important; color: white !important; }
  .rdp-day_today .rdp-button { font-weight: 700; color: var(--color-primary); }
  .rdp-nav_button { color: var(--color-muted-foreground); }
  .rdp-caption_label { font-size: 14px; font-weight: 600; color: var(--color-foreground); }
`

export function CalendarView({ subscriptions }) {
  const paymentDates = useMemo(() => {
    return subscriptions
      .filter((s) => s.status === 'active' && s.nextBillingDate)
      .map((s) => ({
        date: new Date(s.nextBillingDate),
        sub: s,
      }))
  }, [subscriptions])

  const markedDays = paymentDates.map((p) => p.date)

  const dueSubs = paymentDates.filter((p) => {
    const d = p.date
    const today = new Date()
    return d >= today && d <= new Date(today.getTime() + 30 * 86400000)
  }).sort((a, b) => a.date - b.date)

  return (
    <div>
      <style>{dayPickerStyle}</style>
      <div className="bg-card border border-border rounded-2xl p-4 mb-4">
        <DayPicker
          mode="multiple"
          selected={markedDays}
          showOutsideDays
          modifiersClassNames={{ selected: 'rdp-day_selected' }}
        />
      </div>

      {dueSubs.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
            30 วันข้างหน้า
          </p>
          {dueSubs.map(({ date, sub }) => (
            <div key={sub.id} className="flex items-center gap-3 bg-card border border-border rounded-xl p-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: sub.color || '#6b7280' }}
              >
                {sub.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{sub.name}</p>
                <p className="text-xs text-muted-foreground">
                  {date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}
                </p>
              </div>
              <p className="text-sm font-bold text-foreground">{formatCurrency(sub.amount)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
