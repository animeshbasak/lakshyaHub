import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
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
          fontSize: 22,
          fontWeight: 700,
          color: '#0b0b14',
          letterSpacing: '-0.02em',
        }}
      >
        ल
      </div>
    ),
    size
  )
}
