'use client'
import React, { useState } from 'react';
import { Target, X } from 'lucide-react';
import { useResumeStore } from '@/features/resume-builder/store/useResumeStore';
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
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableCompetency({ id, onRemove }: { id: string; onRemove: () => void }) {
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
      {...attributes}
      {...listeners}
      className={`flex max-w-full cursor-grab items-center gap-2 rounded-[10px] border px-3 py-2 text-xs font-bold transition-all active:cursor-grabbing ${
        isDragging
          ? 'scale-110 border-cyan-500 bg-cyan-500 text-white shadow-xl'
          : 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20'
      }`}
    >
      <span className="min-w-0 break-words">{id}</span>
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => onRemove()}
        className="ml-1 text-cyan-400/60 hover:text-red-400 transition-colors focus:outline-none"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function CompetenciesSection() {
  const store = useResumeStore();
  const { competencies, setResumeData } = store;

  const addCompetency = (value: string) => {
    const v = value.trim();
    if (!v || competencies.includes(v)) return;
    setResumeData({ competencies: [...competencies, v] });
  };

  const removeCompetency = (value: string) => {
    setResumeData({ competencies: competencies.filter((c) => c !== value) });
  };

  const reorderCompetencies = (oldIndex: number, newIndex: number) => {
    const items = [...competencies];
    const [moved] = items.splice(oldIndex, 1);
    items.splice(newIndex, 0, moved);
    setResumeData({ competencies: items });
  };
  const [inputValue, setInputValue] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = competencies.indexOf(active.id as string);
      const newIndex = competencies.indexOf(over.id as string);
      reorderCompetencies(oldIndex, newIndex);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      if (inputValue.trim()) {
        addCompetency(inputValue.trim());
        setInputValue('');
      }
    } else if (e.key === 'Backspace' && !inputValue && competencies.length > 0) {
      removeCompetency(competencies[competencies.length - 1]);
    }
  };

  return (
    <section className="space-y-6">
      <div className="space-y-3 border-b border-white/[0.06] pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] text-cyan-400">
            <Target size={18} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">Editor</p>
            <h3 className="text-xl font-bold tracking-tight text-[#f1f5f9]">Core Competencies</h3>
          </div>
        </div>
        <p className="break-words text-sm leading-relaxed text-[#94a3b8]">
          Add focused keywords recruiters and ATS systems should connect with your profile.
        </p>
      </div>

      <div className="space-y-4">
        <p className="ml-0.5 text-[11px] font-bold uppercase tracking-widest text-[#94a3b8]">
          Add focus keywords for ATS optimization. Press{' '}
          <kbd className="mx-1 rounded-md border border-white/10 bg-white/[0.05] px-2 py-0.5 text-[10px] text-[#f1f5f9] shadow-sm">
            Enter
          </kbd>{' '}
          or{' '}
          <kbd className="mx-1 rounded-md border border-white/10 bg-white/[0.05] px-2 py-0.5 text-[10px] text-[#f1f5f9] shadow-sm">
            ,
          </kbd>{' '}
          to add.
        </p>

        <div className="flex min-h-[124px] flex-wrap items-start gap-3 rounded-[14px] border border-white/[0.06] bg-[#111118] p-4 shadow-none transition-all focus-within:border-cyan-500/30">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={competencies} strategy={rectSortingStrategy}>
              {competencies.map((comp) => (
                <SortableCompetency
                  key={comp}
                  id={comp}
                  onRemove={() => removeCompetency(comp)}
                />
              ))}
            </SortableContext>
          </DndContext>

          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              competencies.length === 0
                ? 'e.g. React, TypeScript, Performance Optimization'
                : 'Add item...'
            }
            className="min-w-[220px] flex-1 basis-full border-none bg-transparent py-2 text-sm font-bold text-[#f1f5f9] outline-none break-words placeholder:text-[#94a3b8]/50 focus:ring-0 sm:basis-auto"
          />
        </div>
      </div>
    </section>
  );
}
