'use client'
import React from 'react';
import { useResumeStore } from '@/features/resume-builder/store/useResumeStore';
import { ResumePDFView } from './ResumePDFView';
import { ResumeData, TemplateType } from '@/types';

const TEMPLATE_OPTIONS: Array<{ id: TemplateType; name: string }> = [
  { id: 'harvard', name: 'Harvard' },
  { id: 'modern', name: 'Modern' },
  { id: 'modern-blue', name: 'Modern Blue' },
  { id: 'executive', name: 'Executive' },
  { id: 'minimal', name: 'Minimal' },
  { id: 'faang', name: 'FAANG' },
  { id: 'teal-sidebar', name: 'Teal Sidebar' },
  { id: 'compact-pro', name: 'Compact Pro' },
  { id: 'warm-serif', name: 'Warm Serif' },
  { id: 'dark-header', name: 'Dark Header' },
  { id: 'india-tech', name: 'India Tech' },
  { id: 'classic', name: 'Classic' },
  { id: 'creative', name: 'Creative' },
];

export function PreviewPanel() {
  const store = useResumeStore();
  const template = store.template;
  const updateTemplate = store.updateTemplate;

  // Build the full ResumeData object from store
  const resumeData: ResumeData = {
    id: store.id,
    name: store.name,
    template: store.template,
    header: store.header,
    summary: store.summary,
    skills: store.skills,
    experience: store.experience,
    education: store.education,
    projects: store.projects,
    competencies: store.competencies,
    referenceText: store.referenceText,
    isRefPanelCollapsed: store.isRefPanelCollapsed,
    importReview: store.importReview,
    resumeOrigin: store.resumeOrigin,
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[#111118]">
      {/* Template switcher pills */}
      <div className="flex-shrink-0 overflow-x-auto border-b border-white/[0.06] bg-[#111118]/95 backdrop-blur-sm">
        <div className="flex min-w-max gap-2 px-4 py-3">
          {TEMPLATE_OPTIONS.map(({ id, name }) => (
            <button
              key={id}
              onClick={() => updateTemplate(id)}
              className={`whitespace-nowrap rounded-xl border px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all min-h-[44px] ${
                template === id
                  ? 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400 shadow-lg shadow-cyan-500/10'
                  : 'border-white/[0.06] bg-white/[0.02] text-[#94a3b8] hover:border-cyan-500/20 hover:text-[#f1f5f9]'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {/* PDF Preview */}
      <div className="flex-1 overflow-hidden">
        <ResumePDFView data={resumeData} />
      </div>
    </div>
  );
}
