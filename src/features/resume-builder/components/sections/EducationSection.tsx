'use client'
import React from 'react';
import { GraduationCap, Plus, Trash2 } from 'lucide-react';
import { useResumeStore } from '@/features/resume-builder/store/useResumeStore';

export function EducationSection() {
  const { education, updateEducation, addEducation, removeEducation } = useResumeStore();

  return (
    <section className="space-y-6">
      <div className="space-y-3 border-b border-white/[0.06] pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] text-cyan-400">
            <GraduationCap size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">Editor</p>
            <h3 className="text-xl font-bold tracking-tight text-[#f1f5f9]">Education</h3>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="min-w-0 flex-1 break-words text-sm leading-relaxed text-[#94a3b8]">
            Keep degree, institution, and timeline easy to scan in one pass.
          </p>
          <button
            onClick={addEducation}
            className="inline-flex shrink-0 items-center gap-2 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-400 transition-all active:scale-95 hover:bg-cyan-500/20 min-h-[44px]"
          >
            <Plus size={16} /> Add Education
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {education.map((edu) => (
          <div
            key={edu.id}
            className="group relative grid grid-cols-1 gap-4 rounded-[14px] border border-white/[0.06] bg-[#111118] p-5 transition-all md:grid-cols-2"
          >
            <button
              onClick={() => removeEducation(edu.id)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 opacity-0 transition-opacity z-10 group-hover:opacity-100 min-h-[44px] min-w-[44px]"
            >
              <Trash2 size={16} />
            </button>

            <div className="md:col-span-2">
              <label className="mb-2 ml-0.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#94a3b8]">
                Degree / Program
              </label>
              <input
                type="text"
                value={edu.degree}
                onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                className="w-full rounded-xl border border-white/[0.06] bg-[#1a1a24] px-4 py-3 text-sm font-bold text-[#f1f5f9] placeholder:text-[#94a3b8]/50 outline-none transition-all break-words focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
                placeholder="e.g. B.Tech in Computer Science"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 ml-0.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#94a3b8]">
                Institution
              </label>
              <input
                type="text"
                value={edu.institution}
                onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                className="w-full rounded-xl border border-white/[0.06] bg-[#1a1a24] px-4 py-3 text-sm font-medium text-[#f1f5f9] placeholder:text-[#94a3b8]/50 outline-none transition-all break-words focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
                placeholder="e.g. IIT Bombay / NIT Surathkal"
              />
            </div>
            <div>
              <label className="mb-2 ml-0.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#94a3b8]">
                Time Period
              </label>
              <input
                type="text"
                value={edu.period}
                onChange={(e) => updateEducation(edu.id, 'period', e.target.value)}
                className="w-full rounded-xl border border-white/[0.06] bg-[#1a1a24] px-4 py-3 text-sm font-medium text-[#f1f5f9] placeholder:text-[#94a3b8]/50 outline-none transition-all break-words focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
                placeholder="e.g. 2014 – 2018"
              />
            </div>
            <div>
              <label className="mb-2 ml-0.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#94a3b8]">
                Grade / GPA
              </label>
              <input
                type="text"
                value={edu.grade}
                onChange={(e) => updateEducation(edu.id, 'grade', e.target.value)}
                className="w-full rounded-xl border border-white/[0.06] bg-[#1a1a24] px-4 py-3 text-sm font-bold text-cyan-400 placeholder:text-[#94a3b8]/50 outline-none transition-all break-words focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
                placeholder="e.g. 8.5 CGPA"
              />
            </div>
          </div>
        ))}

        {education.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-[22px] border border-dashed border-white/[0.06] bg-[#111118] py-12 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.04] text-[#94a3b8]">
              <GraduationCap size={32} />
            </div>
            <h4 className="mb-2 text-sm font-bold tracking-tight text-[#f1f5f9]">No education details added yet</h4>
            <p className="mb-8 max-w-xs text-[11px] font-medium leading-relaxed text-[#94a3b8]">
              Adding your academic background completes your professional profile.
            </p>
            <button
              onClick={addEducation}
              className="flex items-center gap-2 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-cyan-400 transition-all hover:bg-cyan-500/20 active:scale-95 min-h-[44px]"
            >
              <Plus size={16} /> Add your education
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
