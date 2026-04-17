'use client'
import React from 'react';
import { AlignLeft, Info, AlertTriangle } from 'lucide-react';
import { useResumeStore } from '@/features/resume-builder/store/useResumeStore';

export function SummarySection() {
  const { summary, updateSummaryLine } = useResumeStore();
  const auditFailures: string[] = [];

  return (
    <section className="space-y-6">
      <div className="space-y-3 border-b border-white/[0.06] pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] text-cyan-400">
            <AlignLeft size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">Editor</p>
            <h3 className="text-xl font-bold tracking-tight text-[#f1f5f9]">Professional Summary</h3>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm text-[#94a3b8]">
          <p className="break-words leading-relaxed">Use up to three short lines to describe value, focus area, and proof.</p>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.06] bg-white/[0.025] px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#94a3b8]">
            <Info size={12} />
            Max 3 lines
          </span>
          {auditFailures?.includes('summary_length') && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/16 bg-amber-400/8 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-amber-200/85">
              <AlertTriangle size={12} />
              Needs sharper summary
            </span>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {[0, 1, 2].map((idx) => {
          const text = summary[idx] || '';
          const isOver = text.length > 180;
          const fieldId = `summary-section-${idx + 1}`;

          return (
            <div
              key={idx}
              className="relative rounded-[14px] border border-white/[0.06] bg-[#111118] p-1 transition-all focus-within:border-cyan-500/30 focus-within:bg-white/[0.04]"
            >
              <label
                htmlFor={fieldId}
                className="mb-2 block px-4 pt-4 text-[10px] font-bold uppercase tracking-[0.18em] text-[#94a3b8]"
              >
                Section {idx + 1}
              </label>
              <textarea
                id={fieldId}
                aria-label={`Summary section ${idx + 1}`}
                value={text}
                onChange={(e) => updateSummaryLine(idx, e.target.value)}
                rows={2}
                className="w-full resize-none bg-transparent px-4 pb-8 text-sm text-[#f1f5f9] placeholder:text-[#94a3b8]/40 outline-none break-words whitespace-pre-wrap"
                placeholder={`Core competency paragraph ${idx + 1}...`}
              />
              <div
                className={`absolute bottom-3 right-4 rounded-md px-2 py-1 text-[10px] font-bold tracking-widest ${
                  isOver ? 'bg-amber-500/10 text-amber-400' : 'bg-black/12 text-[#94a3b8]'
                }`}
              >
                {text.length}/180
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
