'use client'

import { useState, useTransition } from 'react'
import { Plus, Trash2, Pencil, X, BookOpen } from 'lucide-react'
import { ARCHETYPES, type Archetype } from '@/lib/careerops/archetypes'
import { createStory, updateStory, deleteStory, type Story } from '@/actions/storyActions'

interface Props {
  initialStories: Story[]
}

interface DraftState {
  title: string
  situation: string
  task: string
  action: string
  result: string
  reflection: string
  archetype: Archetype | ''
  tags: string
}

const EMPTY: DraftState = {
  title: '', situation: '', task: '', action: '', result: '', reflection: '', archetype: '', tags: '',
}

function fromStory(s: Story): DraftState {
  return {
    title: s.title,
    situation: s.situation ?? '',
    task: s.task ?? '',
    action: s.action ?? '',
    result: s.result ?? '',
    reflection: s.reflection ?? '',
    archetype: (s.archetype as Archetype) ?? '',
    tags: (s.tags ?? []).join(', '),
  }
}

function toPayload(d: DraftState): Partial<Story> {
  return {
    title: d.title,
    situation: d.situation || null,
    task: d.task || null,
    action: d.action || null,
    result: d.result || null,
    reflection: d.reflection || null,
    archetype: d.archetype || null,
    tags: d.tags.split(',').map(t => t.trim()).filter(Boolean),
  }
}

export function StoriesPanel({ initialStories }: Props) {
  const [stories, setStories] = useState<Story[]>(initialStories)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [draft, setDraft] = useState<DraftState>(EMPTY)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function startAdd() {
    setEditingId(null)
    setAdding(true)
    setDraft(EMPTY)
    setError(null)
  }

  function startEdit(s: Story) {
    setAdding(false)
    setEditingId(s.id)
    setDraft(fromStory(s))
    setError(null)
  }

  function cancel() {
    setAdding(false)
    setEditingId(null)
    setDraft(EMPTY)
    setError(null)
  }

  function save() {
    setError(null)
    startTransition(async () => {
      const payload = toPayload(draft)
      if (editingId) {
        const res = await updateStory(editingId, payload)
        if (!res.ok || !res.story) { setError(res.error ?? 'Update failed'); return }
        setStories(prev => prev.map(s => s.id === editingId ? res.story! : s))
      } else {
        const res = await createStory(payload)
        if (!res.ok || !res.story) { setError(res.error ?? 'Create failed'); return }
        setStories(prev => [res.story!, ...prev])
      }
      cancel()
    })
  }

  function remove(id: string) {
    if (typeof window !== 'undefined' && !window.confirm('Delete this story?')) return
    startTransition(async () => {
      const res = await deleteStory(id)
      if (!res.ok) { setError(res.error ?? 'Delete failed'); return }
      setStories(prev => prev.filter(s => s.id !== id))
    })
  }

  const editorOpen = adding || editingId !== null

  return (
    <div className="space-y-4">
      {!editorOpen && (
        <button
          type="button"
          onClick={startAdd}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg border border-dashed border-white/15 text-sm text-white/70 hover:text-white hover:border-white/30 transition-colors min-h-[44px]"
        >
          <Plus size={14} /> New story
        </button>
      )}

      {editorOpen && (
        <Editor
          draft={draft}
          setDraft={setDraft}
          onSave={save}
          onCancel={cancel}
          pending={pending}
          isEdit={!!editingId}
        />
      )}

      {error && (
        <p role="alert" className="text-[11px] text-red-400 px-1">{error}</p>
      )}

      {stories.length === 0 && !editorOpen ? (
        <EmptyState />
      ) : (
        <ul className="space-y-2.5">
          {stories.map(s => (
            <li
              key={s.id}
              className="rounded-xl border border-white/5 bg-white/[0.02] p-4 hover:border-white/15 transition-colors"
            >
              <div className="flex items-start gap-3">
                <span className="mt-1 inline-flex w-8 h-8 rounded-md bg-[color:var(--accent)]/10 border border-[color:var(--accent)]/20 items-center justify-center text-[color:var(--accent)] shrink-0">
                  <BookOpen size={14} />
                </span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-white truncate">{s.title}</h3>
                  <div className="mt-1 flex flex-wrap gap-1.5 text-[10px]">
                    {s.archetype && (
                      <span className="px-2 py-0.5 rounded-full bg-[color:var(--accent)]/10 text-[color:var(--accent)]">
                        {s.archetype}
                      </span>
                    )}
                    {(s.tags ?? []).map(tag => (
                      <span key={tag} className="px-2 py-0.5 rounded-full bg-white/5 text-text-2">{tag}</span>
                    ))}
                  </div>
                  {s.situation && (
                    <p className="mt-2 text-[12px] text-text-2 line-clamp-2">{s.situation}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => startEdit(s)}
                    aria-label={`Edit ${s.title}`}
                    className="p-2 rounded-md text-text-2 hover:text-white hover:bg-white/5 min-h-[36px] min-w-[36px] inline-flex items-center justify-center"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(s.id)}
                    aria-label={`Delete ${s.title}`}
                    className="p-2 rounded-md text-text-2 hover:text-red-400 hover:bg-red-500/5 min-h-[36px] min-w-[36px] inline-flex items-center justify-center"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Editor({
  draft, setDraft, onSave, onCancel, pending, isEdit,
}: {
  draft: DraftState
  setDraft: (d: DraftState) => void
  onSave: () => void
  onCancel: () => void
  pending: boolean
  isEdit: boolean
}) {
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSave() }}
      className="rounded-xl border border-white/15 bg-white/[0.03] p-4 md:p-5 space-y-3"
    >
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-sm font-semibold text-white">
          {isEdit ? 'Edit story' : 'New story'}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Cancel"
          className="p-1.5 rounded-md text-text-2 hover:text-white hover:bg-white/5 min-h-[32px] min-w-[32px] inline-flex items-center justify-center"
        >
          <X size={14} />
        </button>
      </div>

      <Field label="Title" required>
        <input
          type="text"
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          required
          className="w-full bg-white/[0.02] border border-white/10 rounded-md px-2.5 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
          placeholder="e.g. Migrating monolith to microservices at Acme"
        />
      </Field>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="Situation">
          <textarea
            value={draft.situation}
            onChange={(e) => setDraft({ ...draft, situation: e.target.value })}
            rows={3}
            className="w-full bg-white/[0.02] border border-white/10 rounded-md px-2.5 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
            placeholder="What was happening?"
          />
        </Field>
        <Field label="Task">
          <textarea
            value={draft.task}
            onChange={(e) => setDraft({ ...draft, task: e.target.value })}
            rows={3}
            className="w-full bg-white/[0.02] border border-white/10 rounded-md px-2.5 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
            placeholder="What was your charge?"
          />
        </Field>
        <Field label="Action">
          <textarea
            value={draft.action}
            onChange={(e) => setDraft({ ...draft, action: e.target.value })}
            rows={3}
            className="w-full bg-white/[0.02] border border-white/10 rounded-md px-2.5 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
            placeholder="What did you do?"
          />
        </Field>
        <Field label="Result">
          <textarea
            value={draft.result}
            onChange={(e) => setDraft({ ...draft, result: e.target.value })}
            rows={3}
            className="w-full bg-white/[0.02] border border-white/10 rounded-md px-2.5 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
            placeholder="Numbers, outcomes, scale"
          />
        </Field>
      </div>

      <Field label="Reflection (the +R that elevates STAR)">
        <textarea
          value={draft.reflection}
          onChange={(e) => setDraft({ ...draft, reflection: e.target.value })}
          rows={2}
          className="w-full bg-white/[0.02] border border-white/10 rounded-md px-2.5 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
          placeholder="What you'd do differently next time. The interviewer's favorite part."
        />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Archetype">
          <select
            value={draft.archetype}
            onChange={(e) => setDraft({ ...draft, archetype: e.target.value as Archetype | '' })}
            className="w-full bg-white/[0.02] border border-white/10 rounded-md px-2.5 py-2 text-sm text-white focus:border-white/30 focus:outline-none min-h-[40px]"
          >
            <option value="">— None —</option>
            {ARCHETYPES.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </Field>
        <Field label="Tags (comma-separated)">
          <input
            type="text"
            value={draft.tags}
            onChange={(e) => setDraft({ ...draft, tags: e.target.value })}
            className="w-full bg-white/[0.02] border border-white/10 rounded-md px-2.5 py-2 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
            placeholder="leadership, perf, k8s"
          />
        </Field>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={pending}
          className="px-3 py-2 rounded-md text-xs text-text-2 hover:text-white min-h-[36px]"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={pending}
          className="px-4 py-2 rounded-md bg-white text-[#07070b] text-xs font-medium hover:bg-white/90 disabled:opacity-50 min-h-[36px]"
        >
          {pending ? 'Saving…' : isEdit ? 'Save changes' : 'Create story'}
        </button>
      </div>
    </form>
  )
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-widest text-text-2 mb-1.5">
        {label}{required && <span className="text-red-400 ml-1">*</span>}
      </span>
      {children}
    </label>
  )
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 md:p-10 text-center">
      <h2 className="text-base font-semibold text-white mb-1">No stories yet</h2>
      <p className="text-sm text-text-2 max-w-md mx-auto">
        Click &ldquo;New story&rdquo; to capture your first STAR+R.
      </p>
    </div>
  )
}
