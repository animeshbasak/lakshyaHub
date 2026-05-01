import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { listStories } from '@/actions/storyActions'
import { StoriesPanel } from './StoriesPanel.client'

export const metadata: Metadata = {
  title: 'Story bank',
  description: 'STAR+R interview stories. Tag by archetype. Reuse across interviews.',
  robots: { index: false, follow: false },
}

export default async function StoriesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const stories = await listStories()

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 md:px-6 md:py-12">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-widest text-text-2 mb-2">careerops · STAR+R</p>
        <h1 className="text-2xl md:text-3xl font-semibold text-white mb-2">Story bank</h1>
        <p className="text-sm text-text-2 max-w-xl leading-relaxed">
          Capture your interview stories once, reuse them everywhere. STAR+R = Situation,
          Task, Action, Result, Reflection. Tag by archetype to surface relevant stories
          when interview prep ships.
        </p>
      </header>

      <StoriesPanel initialStories={stories} />
    </div>
  )
}
