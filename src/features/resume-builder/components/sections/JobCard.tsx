'use client'
import React, { useState } from 'react';
import { useResumeStore } from '@/features/resume-builder/store/useResumeStore';
import { ChevronDown, ChevronRight, Plus, Trash2, GripVertical } from 'lucide-react';
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
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BulletRow } from './BulletRow';

interface BulletItem {
  id: string;
  text: string;
  isImproving?: boolean;
  originalText?: string;
}

interface JobEntry {
  id: string;
  title: string;
  company: string;
  period: string;
  scale: string;
  bullets: BulletItem[];
}

interface JobCardProps {
  job: JobEntry;
  defaultExpanded: boolean;
}

export function JobCard({ job, defaultExpanded }: JobCardProps) {
  const store = useResumeStore();
  const { updateJob, removeJob, addBullet, setResumeData } = store;
  const [confirmDelete, setConfirmDelete] = useState(false);

  const reorderBullets = (jobId: string, oldIndex: number, newIndex: number) => {
    setResumeData({
      experience: store.experience.map((j) => {
        if (j.id !== jobId) return j;
        const items = [...j.bullets];
        const [moved] = items.splice(oldIndex, 1);
        items.splice(newIndex, 0, moved);
        return { ...j, bullets: items };
      }),
    });
  };
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: job.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = job.bullets.findIndex((b: BulletItem) => b.id === active.id);
      const newIndex = job.bullets.findIndex((b: BulletItem) => b.id === over.id);
      reorderBullets(job.id, oldIndex, newIndex);
    }
  };

  const handleDelete = () => {
    if (confirmDelete) {
      removeJob(job.id);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  const jobContext = `${job.title || 'Role'} at ${job.company || 'Company'}`;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-[14px] border transition-all duration-200 ${
        isDragging
          ? 'z-50 scale-[1.01] border-white/30 bg-white/[0.04] shadow-lg'
          : 'border-white/[0.06] bg-[#111118] shadow-none'
      }`}
    >
      <div className="flex items-start gap-3 p-4">
        <div className="pt-1">
          <button
            type="button"
            className="p-1 text-[#94a3b8] hover:text-[#f1f5f9] cursor-grab active:cursor-grabbing focus:outline-none"
            {...attributes}
            {...listeners}
          >
            <GripVertical size={16} />
          </button>
        </div>

        <div
          className="min-w-0 flex-1 cursor-pointer select-none"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h4 className="break-words whitespace-pre-wrap text-[15px] font-bold leading-snug tracking-tight text-[#f1f5f9]">
                {job.title || <span className="font-normal italic text-[#94a3b8]">Untitled Role</span>}
              </h4>
              {job.company && (
                <p className="mt-1 break-words whitespace-pre-wrap text-sm leading-relaxed text-[#94a3b8]">
                  {job.company}
                </p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#94a3b8]">
                <span className="max-w-full break-words rounded-full border border-white/[0.06] bg-white/[0.025] px-2.5 py-1 text-center leading-relaxed">
                  {job.period || 'Add dates'}
                </span>
                <span>
                  {job.bullets.length} bullet{job.bullets.length === 1 ? '' : 's'}
                </span>
              </div>
            </div>
            <div
              className={`mt-0.5 shrink-0 rounded-lg p-1.5 transition-colors ${
                isExpanded ? 'bg-white/5 text-white' : 'text-[#94a3b8]'
              }`}
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </div>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="space-y-5 border-t border-white/[0.06] bg-white/[0.018] p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label
                htmlFor={`job-title-${job.id}`}
                className="mb-2 ml-0.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#94a3b8]"
              >
                Job Title
              </label>
              <input
                id={`job-title-${job.id}`}
                type="text"
                value={job.title}
                onChange={(e) => updateJob(job.id, 'title', e.target.value)}
                className="w-full rounded-xl border border-white/[0.06] bg-[#1a1a24] px-4 py-3 text-sm text-[#f1f5f9] outline-none break-words transition-all focus:border-white/25 focus:ring-2 focus:ring-white/10"
                placeholder="e.g. SDE II"
              />
            </div>
            <div>
              <label
                htmlFor={`job-company-${job.id}`}
                className="mb-2 ml-0.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#94a3b8]"
              >
                Company
              </label>
              <input
                id={`job-company-${job.id}`}
                type="text"
                value={job.company}
                onChange={(e) => updateJob(job.id, 'company', e.target.value)}
                className="w-full rounded-xl border border-white/[0.06] bg-[#1a1a24] px-4 py-3 text-sm text-[#f1f5f9] outline-none break-words transition-all focus:border-white/25 focus:ring-2 focus:ring-white/10"
                placeholder="e.g. Google"
              />
            </div>
            <div>
              <label
                htmlFor={`job-period-${job.id}`}
                className="mb-2 ml-0.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#94a3b8]"
              >
                Time Period
              </label>
              <input
                id={`job-period-${job.id}`}
                type="text"
                value={job.period}
                onChange={(e) => updateJob(job.id, 'period', e.target.value)}
                className="w-full rounded-xl border border-white/[0.06] bg-[#1a1a24] px-4 py-3 text-sm text-[#f1f5f9] outline-none break-words transition-all focus:border-white/25 focus:ring-2 focus:ring-white/10"
                placeholder="e.g. Jan 2021 - Present"
              />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 ml-0.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#94a3b8]">
                Scale / Metric Context
              </label>
              <input
                type="text"
                value={job.scale}
                onChange={(e) => updateJob(job.id, 'scale', e.target.value)}
                className="w-full rounded-xl border border-white/[0.06] bg-[#1a1a24] px-4 py-3 text-sm font-bold text-white outline-none break-words transition-all focus:border-white/25 focus:ring-2 focus:ring-white/10"
                placeholder="e.g. Managed 10 Lakh+ DAU infrastructure"
              />
            </div>
          </div>

          <div className="mt-6 space-y-4 border-t border-white/[0.06] pt-5">
            <label className="ml-0.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#94a3b8]">
              Bullet Points
            </label>

            <div className="space-y-3">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={job.bullets.map((b: BulletItem) => b.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {job.bullets.map((bullet: BulletItem) => (
                    <BulletRow
                      key={bullet.id}
                      bullet={bullet}
                      jobId={job.id}
                      jobContext={jobContext}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-4">
              <button
                onClick={() => addBullet(job.id)}
                className="flex min-w-[220px] flex-1 items-center justify-center gap-2 rounded-2xl border border-white/[0.06] bg-[#111118] px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-[#94a3b8] transition-all hover:border-white/10 hover:bg-white/[0.05] hover:text-[#f1f5f9] min-h-[44px]"
              >
                <Plus size={16} /> Add Impact Line
              </button>

              <button
                onClick={handleDelete}
                className={`flex items-center gap-1.5 justify-center rounded-xl border p-3 min-h-[44px] text-red-400 transition-all text-xs font-semibold ${
                  confirmDelete
                    ? 'bg-red-500/20 border-red-500/50 animate-pulse'
                    : 'bg-red-500/10 border-red-500/20 hover:bg-red-500/20'
                }`}
                title={confirmDelete ? 'Click again to confirm' : 'Delete Job'}
              >
                <Trash2 size={16} />
                {confirmDelete ? 'Confirm?' : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
