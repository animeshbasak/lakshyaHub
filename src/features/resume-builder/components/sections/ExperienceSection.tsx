'use client'
import React from 'react';
import { useResumeStore } from '@/features/resume-builder/store/useResumeStore';
import { JobCard } from './JobCard';
import { Plus, Briefcase, AlertTriangle } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

export function ExperienceSection() {
  const store = useResumeStore();
  const { experience, addJob, setResumeData } = store;
  const auditFailures: string[] = [];

  const reorderJobs = (oldIndex: number, newIndex: number) => {
    const items = [...store.experience];
    const [moved] = items.splice(oldIndex, 1);
    items.splice(newIndex, 0, moved);
    setResumeData({ experience: items });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = experience.findIndex((j: any) => j.id === active.id);
      const newIndex = experience.findIndex((j: any) => j.id === over.id);
      reorderJobs(oldIndex, newIndex);
    }
  };

  return (
    <section className="space-y-6">
      <div className="space-y-3 border-b border-white/[0.06] pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] text-cyan-400">
            <Briefcase size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">Editor</p>
            <h3 className="text-xl font-bold tracking-tight text-[#f1f5f9]">Work Experience</h3>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 text-sm text-[#94a3b8]">
            <p className="break-words leading-relaxed">
              Capture role, scope, and impact in recruiter-friendly bullet form.
            </p>
            {(auditFailures?.includes('impact_low') || auditFailures?.includes('keywords_missing')) && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/16 bg-amber-400/8 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-amber-200/85">
                <AlertTriangle size={12} />
                Add metrics and keywords
              </span>
            )}
          </div>
          <button
            onClick={addJob}
            className="inline-flex shrink-0 items-center gap-2 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-cyan-400 transition-all active:scale-95 hover:bg-cyan-500/20 min-h-[44px]"
          >
            <Plus size={16} />
            Add Job
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={experience.map((j: any) => j.id)}
            strategy={verticalListSortingStrategy}
          >
            {experience.map((job: any, index: number) => (
              <JobCard key={job.id} job={job} defaultExpanded={index < 2} />
            ))}
          </SortableContext>
        </DndContext>

        {experience.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-[22px] border border-dashed border-white/[0.06] bg-[#111118] py-12 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.04] text-[#94a3b8]">
              <Briefcase size={32} />
            </div>
            <h4 className="mb-2 text-sm font-bold tracking-tight text-[#f1f5f9]">No experience entries</h4>
            <p className="mb-8 max-w-xs text-[11px] font-medium leading-relaxed text-[#94a3b8]">
              Detailing your professional history helps the AI score your resume accurately.
            </p>
            <button
              onClick={addJob}
              className="flex items-center gap-2 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-cyan-400 transition-all hover:bg-cyan-500/20 active:scale-95 min-h-[44px]"
            >
              <Plus size={16} />
              Add your first job
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
