export function Skeleton({ style = {}, className }) {
  return (
    <div
      className={`shimmer${className ? ' ' + className : ''}`}
      style={{ borderRadius: 10, ...style }}
    />
  )
}

export function TaskSkeleton() {
  return (
    <div style={{
      borderRadius: 18, padding: '14px 16px 14px 20px',
      marginBottom: 10, overflow: 'hidden', position: 'relative',
      background: '#1a1a22', border: '1px solid #252530',
    }}>
      {/* priority bar */}
      <Skeleton style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, borderRadius: '18px 0 0 18px' }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <Skeleton style={{ width: 22, height: 22, borderRadius: 99, flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Skeleton style={{ height: 16, width: '68%' }} />
          <div style={{ display: 'flex', gap: 8 }}>
            <Skeleton style={{ height: 12, width: 52 }} />
            <Skeleton style={{ height: 12, width: 72 }} />
          </div>
        </div>
        <Skeleton style={{ width: 44, height: 20, borderRadius: 8, flexShrink: 0 }} />
      </div>
    </div>
  )
}

export function SubSkeleton() {
  return (
    <div style={{
      borderRadius: 18, padding: '14px 16px',
      marginBottom: 10,
      background: '#1a1a22', border: '1px solid #252530',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <Skeleton style={{ width: 46, height: 46, borderRadius: 14, flexShrink: 0 }} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Skeleton style={{ height: 16, width: '48%' }} />
          <Skeleton style={{ height: 12, width: '32%' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
          <Skeleton style={{ height: 17, width: 60 }} />
          <Skeleton style={{ height: 11, width: 40 }} />
        </div>
      </div>
    </div>
  )
}
