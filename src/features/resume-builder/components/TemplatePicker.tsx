// src/features/resume-builder/components/TemplatePicker.tsx
'use client'
import { TemplateType } from '@/types'
import { TEMPLATE_NAMES } from '@/features/resume-builder/templates/index'
import { twMerge } from 'tailwind-merge'

interface Props {
  currentTemplate: TemplateType
  onSelect: (template: TemplateType) => void
}

const ACCENT_COLORS: Record<string, string> = {
  'harvard':      'bg-red-700',
  'modern':       'bg-blue-600',
  'modern-blue':  'bg-blue-500',
  'executive':    'bg-slate-500',
  'minimal':      'bg-gray-400',
  'faang':        'bg-gray-900',
  'teal-sidebar': 'bg-teal-600',
  'compact-pro':  'bg-gray-700',
  'warm-serif':   'bg-amber-700',
  'dark-header':  'bg-slate-800',
  'india-tech':   'bg-orange-600',
  'classic':      'bg-stone-600',
  'creative':     'bg-indigo-600',
}

export function TemplatePicker({ currentTemplate, onSelect }: Props) {
  const entries = Object.entries(TEMPLATE_NAMES) as [TemplateType, string][]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 p-1">
      {entries.map(([key, label]) => {
        const isSelected = currentTemplate === key
        const accentColor = ACCENT_COLORS[key] ?? 'bg-cyan-600'

        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            className={twMerge(
              'group relative flex flex-col overflow-hidden rounded-lg border transition-all duration-150',
              'bg-[#111118] text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400',
              isSelected
                ? 'border-cyan-400 ring-2 ring-cyan-400/60 shadow-lg shadow-cyan-500/10'
                : 'border-white/[0.06] hover:border-white/[0.14] hover:shadow-md hover:shadow-black/30'
            )}
            aria-pressed={isSelected}
            aria-label={`Select ${label} template`}
          >
            {/* Accent bar */}
            <div className={twMerge('h-1.5 w-full shrink-0', accentColor)} />

            {/* Card body */}
            <div className="flex flex-col gap-1 px-3 py-2.5">
              {/* Simulated resume lines */}
              <div className="flex flex-col gap-1 opacity-30 pointer-events-none select-none" aria-hidden>
                <div className="h-1.5 w-3/4 rounded-full bg-white/60" />
                <div className="h-1 w-1/2 rounded-full bg-white/40" />
                <div className="mt-1 h-1 w-full rounded-full bg-white/20" />
                <div className="h-1 w-5/6 rounded-full bg-white/20" />
                <div className="h-1 w-4/6 rounded-full bg-white/20" />
              </div>

              {/* Label */}
              <span
                className={twMerge(
                  'mt-2 text-xs font-medium leading-tight',
                  isSelected ? 'text-cyan-300' : 'text-white/70 group-hover:text-white/90'
                )}
              >
                {label}
              </span>
            </div>

            {/* Selected check badge */}
            {isSelected && (
              <span
                className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-400"
                aria-hidden
              >
                <svg
                  className="h-2.5 w-2.5 text-[#111118]"
                  viewBox="0 0 10 10"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="1.5,5.5 3.5,7.5 8.5,2.5" />
                </svg>
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
