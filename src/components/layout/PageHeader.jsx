/**
 * Shared sticky page header — used by Tasks, Subscriptions, Split, Dashboard.
 *
 * Props:
 *   title       — main heading text
 *   right       — optional JSX for the right slot (badges, counts)
 *   sub         — optional JSX for a second row below the title row
 *   onSettings  — if provided, renders a gear icon button on the far right
 */
export function PageHeader({ title, right, sub, onSettings }) {
  return (
    <div
      style={{
        flexShrink: 0,
        background: 'rgba(15,15,20,0.97)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid #252530',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        zIndex: 10,
      }}
    >
      {/* Main row */}
      <div
        style={{
          height: 56,
          paddingLeft: 20,
          paddingRight: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <h1
          style={{
            flex: 1,
            fontSize: 22,
            fontWeight: 800,
            color: '#f0f0f8',
            letterSpacing: '-0.4px',
            lineHeight: 1,
            margin: 0,
          }}
        >
          {title}
        </h1>

        {/* Status badges */}
        {right && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {right}
          </div>
        )}

        {/* Settings gear — only when onSettings is provided */}
        {onSettings && (
          <button
            type="button"
            aria-label="ตั้งค่า"
            onClick={onSettings}
            style={{
              width: 36, height: 36, borderRadius: 11, flexShrink: 0,
              background: '#1a1a22', border: '1px solid #252530',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b6b88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>
        )}
      </div>

      {/* Optional second row */}
      {sub && (
        <div style={{ paddingLeft: 20, paddingRight: 16, paddingBottom: 12 }}>
          {sub}
        </div>
      )}
    </div>
  )
}
