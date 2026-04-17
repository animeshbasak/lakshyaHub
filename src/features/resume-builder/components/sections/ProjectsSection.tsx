'use client'
import React from 'react';
import { Boxes, Plus, Trash2, Link2 } from 'lucide-react';
import { useResumeStore } from '@/features/resume-builder/store/useResumeStore';

export function ProjectsSection() {
  const store = useResumeStore();
  const { addProject, updateProject, removeProject, setResumeData } = store;
  const projects = store.projects ?? [];

  const updateProjectTechnologies = (id: string, value: string) => {
    setResumeData({
      projects: projects.map((project) =>
        project.id === id
          ? {
              ...project,
              technologies: value
                .split(/[,|•·]/)
                .map((item) => item.trim())
                .filter(Boolean),
            }
          : project
      ),
    });
  };

  const addProjectBullet = (projectId: string) => {
    setResumeData({
      projects: projects.map((project) =>
        project.id !== projectId
          ? project
          : {
              ...project,
              bullets: [...project.bullets, { id: `pb_${Date.now()}`, text: '' }],
            }
      ),
    });
  };

  const updateProjectBullet = (projectId: string, bulletId: string, text: string) => {
    setResumeData({
      projects: projects.map((project) =>
        project.id !== projectId
          ? project
          : {
              ...project,
              bullets: project.bullets.map((bullet) =>
                bullet.id === bulletId ? { ...bullet, text } : bullet
              ),
            }
      ),
    });
  };

  const removeProjectBullet = (projectId: string, bulletId: string) => {
    setResumeData({
      projects: projects.map((project) =>
        project.id !== projectId
          ? project
          : {
              ...project,
              bullets: project.bullets.filter((bullet) => bullet.id !== bulletId),
            }
      ),
    });
  };

  return (
    <section className="space-y-6">
      <div className="space-y-3 border-b border-white/[0.06] pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] text-cyan-400">
            <Boxes size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">Editor</p>
            <h3 className="text-xl font-bold tracking-tight text-[#f1f5f9]">Side Projects &amp; AI Builds</h3>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="min-w-0 flex-1 break-words text-sm leading-relaxed text-[#94a3b8]">
            Keep product names, tech stack, links, and bulletized impact visible as first-class structured work.
          </p>
          <button
            onClick={() => addProject('side-project')}
            className="inline-flex shrink-0 items-center gap-2 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-400 transition-all active:scale-95 hover:bg-cyan-500/20 min-h-[44px]"
          >
            <Plus size={16} />
            Add Project
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {projects.map((project) => (
          <div
            key={project.id}
            className="relative rounded-[14px] border border-white/[0.06] bg-[#111118] p-5 transition-all"
          >
            <button
              onClick={() => removeProject(project.id)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 transition-all hover:bg-red-500/20 min-h-[44px] min-w-[44px]"
              aria-label="Remove project"
            >
              <Trash2 size={16} />
            </button>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 ml-0.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#94a3b8]">
                  Project / Product Name
                </label>
                <input
                  type="text"
                  value={project.name}
                  onChange={(e) => updateProject(project.id, 'name', e.target.value)}
                  className="w-full rounded-xl border border-white/[0.06] bg-[#1a1a24] px-4 py-3 text-sm font-bold text-[#f1f5f9] placeholder:text-[#94a3b8]/50 outline-none break-words transition-all focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
                  placeholder="e.g. Lakshya Resume"
                />
              </div>

              <div>
                <label className="mb-2 ml-0.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#94a3b8]">
                  Project Type
                </label>
                <select
                  value={project.kind || 'project'}
                  onChange={(e) => updateProject(project.id, 'kind', e.target.value as any)}
                  className="w-full rounded-xl border border-white/[0.06] bg-[#1a1a24] px-4 py-3 text-sm font-medium text-[#f1f5f9] outline-none break-words transition-all focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
                >
                  <option value="project">Project</option>
                  <option value="side-project">Side Project</option>
                  <option value="ongoing-learning">Ongoing Learning</option>
                </select>
              </div>

              <div>
                <label className="mb-2 ml-0.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#94a3b8]">
                  Time Period
                </label>
                <input
                  type="text"
                  value={project.period}
                  onChange={(e) => updateProject(project.id, 'period', e.target.value)}
                  className="w-full rounded-xl border border-white/[0.06] bg-[#1a1a24] px-4 py-3 text-sm font-medium text-[#f1f5f9] placeholder:text-[#94a3b8]/50 outline-none break-words transition-all focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
                  placeholder="e.g. 2025 - Present"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 ml-0.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#94a3b8]">
                  Description
                </label>
                <textarea
                  value={project.description}
                  onChange={(e) => updateProject(project.id, 'description', e.target.value)}
                  rows={3}
                  className="min-h-[96px] w-full resize-y rounded-xl border border-white/[0.06] bg-[#1a1a24] px-4 py-3 text-sm leading-relaxed text-[#f1f5f9] placeholder:text-[#94a3b8]/50 outline-none break-words transition-all focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
                  placeholder="What it is, why it matters, and what makes it distinct."
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 ml-0.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#94a3b8]">
                  Technologies
                </label>
                <textarea
                  value={project.technologies.join(', ')}
                  onChange={(e) => updateProjectTechnologies(project.id, e.target.value)}
                  rows={2}
                  className="min-h-[72px] w-full resize-y rounded-xl border border-white/[0.06] bg-[#1a1a24] px-4 py-3 text-sm leading-relaxed text-[#f1f5f9] placeholder:text-[#94a3b8]/50 outline-none break-words transition-all focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
                  placeholder="React, TypeScript, Supabase, Groq..."
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 ml-0.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#94a3b8]">
                  <Link2 size={12} />
                  Link
                </label>
                <input
                  type="text"
                  value={project.link}
                  onChange={(e) => updateProject(project.id, 'link', e.target.value)}
                  className="w-full rounded-xl border border-white/[0.06] bg-[#1a1a24] px-4 py-3 text-sm text-[#f1f5f9] placeholder:text-[#94a3b8]/50 outline-none break-words transition-all focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="mt-6 space-y-3 border-t border-white/[0.06] pt-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#94a3b8]">Project Bullets</p>
                <button
                  onClick={() => addProjectBullet(project.id)}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.04] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#94a3b8] transition-all hover:border-cyan-500/30 hover:bg-cyan-500/10 hover:text-cyan-400 min-h-[44px]"
                >
                  <Plus size={14} />
                  Add Bullet
                </button>
              </div>

              <div className="space-y-3">
                {project.bullets.map((bullet) => (
                  <div key={bullet.id} className="flex items-start gap-3">
                    <span className="mt-3 text-[#94a3b8]/50">•</span>
                    <textarea
                      value={bullet.text}
                      onChange={(e) => updateProjectBullet(project.id, bullet.id, e.target.value)}
                      rows={2}
                      className="min-h-[72px] flex-1 resize-y rounded-xl border border-white/[0.06] bg-[#1a1a24] px-4 py-3 text-sm leading-relaxed text-[#f1f5f9] placeholder:text-[#94a3b8]/50 outline-none break-words transition-all focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
                      placeholder="Add a bulletized project impact line."
                    />
                    <button
                      onClick={() => removeProjectBullet(project.id, bullet.id)}
                      className="mt-2 flex h-9 w-9 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 transition-all hover:bg-red-500/20 min-h-[44px] min-w-[44px]"
                      aria-label="Remove project bullet"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {projects.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-[22px] border border-dashed border-white/[0.06] bg-[#111118] py-12 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.04] text-[#94a3b8]">
              <Boxes size={32} />
            </div>
            <h4 className="mb-2 text-sm font-bold tracking-tight text-[#f1f5f9]">No project entries yet</h4>
            <p className="mb-8 max-w-xs text-[11px] font-medium leading-relaxed text-[#94a3b8]">
              Parsed AI products, side builds, and ongoing learning entries will appear here instead of getting buried in review notes.
            </p>
            <button
              onClick={() => addProject('side-project')}
              className="flex items-center gap-2 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-cyan-400 transition-all hover:bg-cyan-500/20 active:scale-95 min-h-[44px]"
            >
              <Plus size={16} />
              Add your first project
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
