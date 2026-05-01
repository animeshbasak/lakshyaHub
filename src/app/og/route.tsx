/**
 * Dynamic OG image route — /og?page=...&...
 *
 * Per SEO plan SEO-3.1. Used by /share/[id] for per-evaluation cards
 * and by future surfaces that need parameterized OG. Falls through to a
 * branded default identical to opengraph-image.tsx.
 *
 * Query params:
 *   page=home              — default brand card
 *   page=eval &score=X &archetype=Y &company=Z
 *   page=guide &archetype=Y
 */

import { ImageResponse } from 'next/og'
import type { NextRequest } from 'next/server'

export const runtime = 'edge'

const SIZE = { width: 1200, height: 630 }

function tierColor(score: number): string {
  if (score >= 4.0) return '#4ade80'
  if (score >= 3.0) return '#fbbf24'
  return '#f87171'
}

function ScoreRing({ score }: { score: number }) {
  const stroke = 12
  const r = 96
  const circ = 2 * Math.PI * r
  const fillPct = Math.max(0, Math.min(1, score / 5))
  const offset = circ - fillPct * circ
  return (
    <div style={{ position: 'relative', width: 220, height: 220, display: 'flex' }}>
      <svg width={220} height={220}>
        <circle cx={110} cy={110} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} />
        <circle
          cx={110} cy={110} r={r} fill="none"
          stroke={tierColor(score)}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform="rotate(-90 110 110)"
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: 80,
          fontWeight: 700,
          letterSpacing: '-0.04em',
        }}
      >
        {score.toFixed(1)}
        <span style={{ fontSize: 18, opacity: 0.45, fontWeight: 500, marginTop: -8 }}>/ 5</span>
      </div>
    </div>
  )
}

function BrandRow() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 12,
          background: 'linear-gradient(135deg, #a68aff 0%, #5d9fff 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 32,
          fontWeight: 700,
          color: '#0b0b14',
          letterSpacing: '-0.02em',
        }}
      >
        ल
      </div>
      <span style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', color: '#fff' }}>Lakshya</span>
    </div>
  )
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = searchParams.get('page') ?? 'home'

  if (page === 'eval') {
    const score = parseFloat(searchParams.get('score') ?? '0')
    const archetype = searchParams.get('archetype') ?? ''
    const company = searchParams.get('company') ?? 'Anonymous company'
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
            padding: 64,
            position: 'relative',
          }}
        >
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
          <BrandRow />
          <div style={{ display: 'flex', alignItems: 'center', gap: 56, marginTop: 'auto' }}>
            <ScoreRing score={isFinite(score) ? score : 0} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
              <span
                style={{
                  fontSize: 14,
                  letterSpacing: '0.32em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.5)',
                }}
              >
                A-G evaluation
              </span>
              <span style={{ fontSize: 56, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.05 }}>
                {company.length > 40 ? company.slice(0, 38) + '…' : company}
              </span>
              {archetype && (
                <span
                  style={{
                    display: 'flex',
                    alignSelf: 'flex-start',
                    padding: '6px 14px',
                    borderRadius: 999,
                    background: 'rgba(166,138,255,0.12)',
                    border: '1px solid rgba(166,138,255,0.3)',
                    color: '#a68aff',
                    fontSize: 18,
                    fontWeight: 500,
                  }}
                >
                  archetype · {archetype}
                </span>
              )}
            </div>
          </div>
        </div>
      ),
      SIZE
    )
  }

  if (page === 'guide') {
    const archetype = searchParams.get('archetype') ?? ''
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
          }}
        >
          <BrandRow />
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
            <span
              style={{
                fontSize: 18,
                letterSpacing: '0.32em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.5)',
              }}
            >
              archetype guide
            </span>
            <span style={{ fontSize: 88, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1.05 }}>
              {archetype || 'Career playbook'}
            </span>
            <span style={{ fontSize: 26, color: 'rgba(255,255,255,0.55)', maxWidth: 900, lineHeight: 1.4 }}>
              How to land — interview loop, signal patterns, real-eval case studies.
            </span>
          </div>
        </div>
      ),
      SIZE
    )
  }

  // Default — same as opengraph-image.tsx (kept here so /og?page=home works)
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
        }}
      >
        <BrandRow />
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 18 }}>
          <span
            style={{
              fontSize: 18,
              letterSpacing: '0.32em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            careerops · A-G evaluator
          </span>
          <span style={{ fontSize: 88, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1.05 }}>
            Aim before you apply.
          </span>
          <span style={{ fontSize: 26, color: 'rgba(255,255,255,0.55)', maxWidth: 900, lineHeight: 1.4 }}>
            AI-powered job evaluation, tailored CVs, archetype-driven search.
          </span>
        </div>
      </div>
    ),
    SIZE
  )
}
