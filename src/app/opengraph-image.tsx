import { ImageResponse } from 'next/og'

export const alt = 'Lakshya — Aim before you apply'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: '#07070b',
          color: '#fff',
          padding: 80,
          position: 'relative',
        }}
      >
        {/* Glow accent */}
        <div
          style={{
            position: 'absolute',
            top: -200,
            right: -200,
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(166,138,255,0.18), transparent 70%)',
          }}
        />

        {/* Logo + brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #a68aff 0%, #5d9fff 100%)',
              color: '#0b0b14',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 40,
              fontWeight: 700,
              letterSpacing: '-0.02em',
            }}
          >
            ल
          </div>
          <span style={{ fontSize: 36, fontWeight: 600, letterSpacing: '-0.02em' }}>Lakshya</span>
        </div>

        {/* Headline */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <span
            style={{
              fontSize: 18,
              letterSpacing: '0.32em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.5)',
              fontWeight: 500,
            }}
          >
            careerops · A-G evaluator
          </span>
          <span
            style={{
              fontSize: 88,
              fontWeight: 700,
              letterSpacing: '-0.04em',
              lineHeight: 1.05,
              maxWidth: 900,
            }}
          >
            Aim before you apply.
          </span>
          <span style={{ fontSize: 28, color: 'rgba(255,255,255,0.6)', maxWidth: 900, lineHeight: 1.4 }}>
            AI-powered job evaluation, tailored CVs, archetype-driven search.
          </span>
        </div>
      </div>
    ),
    size
  )
}
