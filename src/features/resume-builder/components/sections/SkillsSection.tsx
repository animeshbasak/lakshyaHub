'use client'
import React from 'react';
import { useResumeStore } from '@/features/resume-builder/store/useResumeStore';
import { Trash2, Plus, Wrench, AlertTriangle, GripVertical } from 'lucide-react';
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

function SortableSkillRow({ id, skill }: { id: string; skill: any }) {
  const { updateSkillRow, removeSkillRow } = useResumeStore();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-[14px] border p-4 transition-all duration-200 ${
        isDragging
          ? 'z-50 border-white/30 bg-white/[0.04] shadow-lg'
          : 'border-white/[0.06] bg-[#111118] shadow-none'
      }`}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#94a3b8]">Skill Category</p>
          <p className="mt-1 break-words text-sm leading-relaxed text-[#94a3b8]/70">
            Keep related skills grouped so recruiters can scan them fast.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <div className="mt-1 opacity-30 transition-opacity hover:opacity-100">
            <button
              type="button"
              className="p-1 text-[#94a3b8] hover:text-[#f1f5f9] cursor-grab active:cursor-grabbing focus:outline-none"
              {...attributes}
              {...listeners}
            >
              <GripVertical size={16} />
            </button>
          </div>
          <button
            type="button"
            onClick={() => removeSkillRow(id)}
            className="mt-1 flex items-center justify-center rounded-lg p-2.5 min-h-[44px] min-w-[44px] text-[#94a3b8] transition-all hover:bg-red-500/10 hover:text-red-400 focus:outline-none"
            title="Remove category"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="space-y-3.5">
        <div>
          <label className="mb-2 ml-0.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#94a3b8]">
            Category
          </label>
          <input
            type="text"
            value={skill.category}
            onChange={(e) => updateSkillRow(id, 'category', e.target.value)}
            placeholder="e.g. Frontend"
            className="w-full rounded-xl border border-white/[0.06] bg-[#1a1a24] px-4 py-3 text-sm font-bold text-[#f1f5f9] outline-none break-words transition-all focus:border-white/25 focus:ring-2 focus:ring-white/10"
          />
        </div>
        <div>
          <label className="mb-2 ml-0.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#94a3b8]">
            Skills (comma separated)
          </label>
          <textarea
            value={skill.values}
            onChange={(e) => updateSkillRow(id, 'values', e.target.value)}
            placeholder="ReactJS, TypeScript, Design Systems, Performance Optimization..."
            rows={3}
            className="min-h-[88px] w-full resize-y rounded-xl border border-white/[0.06] bg-[#1a1a24] px-4 py-3 text-sm leading-relaxed text-[#f1f5f9] placeholder:text-[#94a3b8]/50 outline-none transition-all focus:border-white/25 focus:ring-2 focus:ring-white/10 break-words"
          />
        </div>
      </div>
    </div>
  );
}

export function SkillsSection() {
  const store = useResumeStore();
  const { skills, addSkillRow, setResumeData } = store;
  const auditFailures: string[] = [];

  const reorderSkills = (oldIndex: number, newIndex: number) => {
    const items = [...store.skills];
    const [moved] = items.splice(oldIndex, 1);
    items.splice(newIndex, 0, moved);
    setResumeData({ skills: items });
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = skills.findIndex((s: any) => s.id === active.id);
      const newIndex = skills.findIndex((s: any) => s.id === over.id);
      reorderSkills(oldIndex, newIndex);
    }
  };

  return (
    <section className="space-y-5">
      <div className="space-y-3 border-b border-white/[0.06] pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] text-white">
            <Wrench size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">Editor</p>
            <h3 className="text-xl font-bold tracking-tight text-[#f1f5f9]">Technical Skills</h3>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 text-sm text-[#94a3b8]">
            <p className="break-words leading-relaxed">
              Group skills by category so ATS terms stay readable and easy to scan.
            </p>
            {auditFailures?.includes('keywords_missing') && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/16 bg-amber-400/8 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-amber-200/85">
                <AlertTriangle size={12} />
                Missing role keywords
              </span>
            )}
          </div>
          <button
            onClick={addSkillRow}
            className="inline-flex shrink-0 items-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white transition-all active:scale-95 hover:bg-white/10 min-h-[44px]"
          >
            <Plus size={16} />
            Add Category
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={skills.map((s: any) => s.id)} strategy={verticalListSortingStrategy}>
            {skills.map((skill: any) => (
              <SortableSkillRow key={skill.id} id={skill.id} skill={skill} />
            ))}
          </SortableContext>
        </DndContext>

        {skills.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-[22px] border border-dashed border-white/[0.06] bg-[#111118] py-12 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/[0.04] text-[#94a3b8]">
              <Wrench size={32} />
            </div>
            <h4 className="mb-2 text-sm font-bold tracking-tight text-[#f1f5f9]">No skills added</h4>
            <p className="mb-8 max-w-xs text-[11px] font-medium leading-relaxed text-[#94a3b8]">
              Organizing your technical arsenal into clear categories helps recruiters scan your profile faster.
            </p>
            <button
              onClick={addSkillRow}
              className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-5 py-3 text-xs font-bold uppercase tracking-[0.18em] text-white transition-all hover:bg-white/10 active:scale-95 min-h-[44px]"
            >
              <Plus size={16} />
              Add your first category
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
