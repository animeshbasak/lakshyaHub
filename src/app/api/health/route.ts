import { NextResponse } from 'next/server'

export function GET() {
  const providers = ['GEMINI', 'GROQ', 'OPENROUTER', 'NVIDIA']
  const enabled = providers
    .filter(p => process.env[`AI_PROVIDER_${p}_ENABLED`] !== 'false')
    .map(p => p.toLowerCase())
  return NextResponse.json({ enabled })
}
