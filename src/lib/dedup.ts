// src/lib/dedup.ts
export async function computeDedupHash(title: string, company: string): Promise<string> {
  const input = `${title.toLowerCase().trim()}${company.toLowerCase().trim()}`
  const encoder = new TextEncoder()
  const data = encoder.encode(input)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}
