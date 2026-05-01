export function BrandMark({ size = 28 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        background: 'var(--grad-brand)',
        display: 'grid',
        placeItems: 'center',
        boxShadow:
          '0 2px 8px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
        flexShrink: 0,
      }}
    >
      <span
        style={{
          color: '#06060a',
          fontWeight: 700,
          fontSize: size * 0.58,
          lineHeight: 1,
          letterSpacing: '-0.02em',
        }}
      >
        ल
      </span>
    </div>
  )
}
