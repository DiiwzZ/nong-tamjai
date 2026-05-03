/**
 * Shared sticky page header — used by Tasks, Subscriptions, Dashboard.
 * Sits as a flex sibling ABOVE the scroll container so it never scrolls away.
 *
 * Props:
 *   title      — main heading text
 *   right      — optional JSX for the right slot
 *   sub        — optional JSX for a second row below the title row (extra info)
 */
export function PageHeader({ title, right, sub }) {
  return (
    <div
      style={{
        flexShrink: 0,
        background: 'rgba(15,15,20,0.97)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid #252530',
        /* Extend up under the status bar on home-screen PWA */
        paddingTop: 'env(safe-area-inset-top, 0px)',
        zIndex: 10,
      }}
    >
      {/* Main row */}
      <div
        style={{
          height: 56,
          paddingLeft: 20,
          paddingRight: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <h1
          style={{
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

        {right && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            {right}
          </div>
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
