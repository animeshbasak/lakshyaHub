import { NextResponse } from 'next/server'

export async function GET() {
  const providers = ['GEMINI', 'GROQ', 'OPENROUTER', 'NVIDIA']
  const enabled = providers.filter(p => {
    const key = process.env[`AI_PROVIDER_${p}_API_KEY`]
    const on = process.env[`AI_PROVIDER_${p}_ENABLED`]
    return key && on !== 'false'
  }).map(p => p.toLowerCase())
  return NextResponse.json({ enabled })
}
