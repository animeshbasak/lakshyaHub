import { createClient } from '@/lib/supabase/client'
import { ResumeData, ResumeProfile } from '@/types'

export function extractProfileFromResume(data: ResumeData): Partial<ResumeProfile> {
  const skills = data.skills.flatMap(row =>
    row.values.split(',').map(s => s.trim()).filter(Boolean)
  )
  return {
    target_titles: [data.header.title].filter(Boolean),
    skills,
    full_resume_text: [
      data.header.name, data.header.title,
      data.summary.join(' '),
      data.experience.map(e => `${e.title} at ${e.company} ${e.bullets.map(b => b.text).join(' ')}`).join(' '),
      data.skills.map(s => `${s.category}: ${s.values}`).join(' '),
    ].join('\n'),
    source: 'insaneresumake' as const,
    updated_at: new Date().toISOString(),
  }
}

export async function syncResumeProfile(data: ResumeData): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return
  const profile = extractProfileFromResume(data)
  await supabase
    .from('resume_profiles')
    .upsert({ id: user.id, ...profile, synced_at: new Date().toISOString() })
}
