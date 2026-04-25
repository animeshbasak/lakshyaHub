import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #a68aff 0%, #5d9fff 100%)',
          fontSize: 124,
          fontWeight: 700,
          color: '#0b0b14',
          letterSpacing: '-0.02em',
          borderRadius: 38,
        }}
      >
        ल
      </div>
    ),
    size
  )
}
