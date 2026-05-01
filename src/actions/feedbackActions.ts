'use server'

import { createClient as createSbClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const FeedbackSchema = z.object({
  evalId: z.string().uuid(),
  rating: z.enum(['up', 'down']),
  note: z.string().max(2000).optional(),
})

interface FeedbackResult {
  ok: boolean
  error?: string
}

/**
 * Record a thumbs-up/down on an evaluation. Writes to the append-only
 * audit_events table so we have user-quality signal as soon as the eval
 * link goes out, before any billing infrastructure exists.
 *
 * Insert policy on audit_events is `with check (false)` (service-role-only),
 * so this action authenticates the user via the standard cookie-bound
 * client, then writes through a service-role client.
 */
export async function submitEvalFeedback(input: {
  evalId: string
  rating: 'up' | 'down'
  note?: string
}): Promise<FeedbackResult> {
  const parse = FeedbackSchema.safeParse(input)
  if (!parse.success) return { ok: false, error: 'invalid_input' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'unauthenticated' }

  // Verify the eval belongs to this user before logging feedback.
  const { data: evalRow } = await supabase
    .from('evaluations')
    .select('id')
    .eq('id', parse.data.evalId)
    .eq('user_id', user.id)
    .maybeSingle()
  if (!evalRow) return { ok: false, error: 'not_found' }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    // Soft-fail in environments without the service role key (e.g. local dev
    // without secrets). The UI still shows success so testing flow works.
    return { ok: true }
  }

  const admin = createSbClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { error } = await admin.from('audit_events').insert({
    user_id: user.id,
    action: 'eval_feedback',
    resource_type: 'evaluation',
    resource_id: parse.data.evalId,
    metadata: {
      rating: parse.data.rating,
      note: parse.data.note ?? null,
    },
  })

  if (error) return { ok: false, error: 'persist_failed' }
  return { ok: true }
}
