'use client'
import React, { useRef, useEffect, useState } from 'react';
import { useResumeStore } from '@/features/resume-builder/store/useResumeStore';
import { Trash2, Sparkles, Undo2, Loader2, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
interface BulletItem {
  id: string;
  text: string;
  isImproving?: boolean;
  originalText?: string;
}

interface BulletRowProps {
  jobId: string;
  jobContext: string;
  bullet: BulletItem;
}

async function improveBullet(bulletText: string, jobContext: string): Promise<string> {
  const res = await fetch('/api/ai/bullet-rewrite', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bulletText, jobContext }),
  });
  if (!res.ok) {
    throw new Error('We could not improve this bullet right now. Try again in a moment.');
  }
  const data = await res.json() as { success: boolean; improved?: string; error?: string };
  if (!data.success || typeof data.improved !== 'string') {
    throw new Error(data.error ?? 'We could not improve this bullet right now. Try again in a moment.');
  }
  return data.improved;
}

export function BulletRow({ jobId, jobContext, bullet }: BulletRowProps) {
  const store = useResumeStore();
  const { updateBullet, removeBullet, setBulletImproving, setResumeData } = store;

  // setBulletText: update bullet text and optionally save original
  const setBulletText = (jobId: string, bulletId: string, text: string, saveOriginal: boolean) => {
    setResumeData({
      experience: store.experience.map((j) => {
        if (j.id !== jobId) return j;
        return {
          ...j,
          bullets: j.bullets.map((b) => {
            if (b.id !== bulletId) return b;
            return {
              ...b,
              text,
              originalText: saveOriginal ? b.text : b.originalText,
              isImproving: false,
            };
          }),
        };
      }),
    });
  };

  // revertBullet: restore originalText
  const revertBullet = (jobId: string, bulletId: string) => {
    setResumeData({
      experience: store.experience.map((j) => {
        if (j.id !== jobId) return j;
        return {
          ...j,
          bullets: j.bullets.map((b) => {
            if (b.id !== bulletId) return b;
            if (b.originalText !== undefined) {
              return { ...b, text: b.originalText, originalText: undefined };
            }
            return b;
          }),
        };
      }),
    });
  };
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: bullet.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  const autoResize = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    autoResize();
  }, [bullet.text]);

  const handleImprove = async () => {
    if (!bullet.text.trim() || bullet.isImproving) return;
    setFeedbackMessage('');
    setBulletImproving(jobId, bullet.id, true);
    try {
      const improvedText = await improveBullet(bullet.text, jobContext);
      setBulletText(jobId, bullet.id, improvedText, true);
    } catch (error: any) {
      console.error(error);
      setFeedbackMessage(
        error?.message || "Couldn't improve this bullet right now. Try again in a moment."
      );
    } finally {
      setBulletImproving(jobId, bullet.id, false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative flex items-start gap-3 rounded-xl border p-3.5 transition-all duration-200 ${
        isDragging
          ? 'z-50 border-cyan-500/50 bg-white/[0.04] shadow-lg'
          : 'border-white/[0.06] bg-[#111118] shadow-none'
      }`}
    >
      <div className="mt-1.5 opacity-30 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          className="p-1 text-[#94a3b8] hover:text-[#f1f5f9] cursor-grab active:cursor-grabbing focus:outline-none"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={16} />
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-3.5">
        <textarea
          ref={textareaRef}
          value={bullet.text}
          onChange={(e) => {
            updateBullet(jobId, bullet.id, e.target.value);
            autoResize();
          }}
          disabled={bullet.isImproving}
          placeholder="Describe your achievement... e.g., Increased conversion by 15% through..."
          rows={1}
          className="min-h-[30px] w-full resize-none bg-transparent py-0.5 text-sm leading-relaxed text-[#f1f5f9] placeholder:text-[#94a3b8]/50 outline-none break-words whitespace-pre-wrap disabled:opacity-50"
        />

        {feedbackMessage && (
          <div className="rounded-xl border border-cyan-500/16 bg-cyan-500/5 px-3 py-2 text-[11px] font-medium text-[#f1f5f9]">
            {feedbackMessage}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-end gap-2 opacity-70 transition-all group-hover:opacity-100 focus-within:opacity-100">
          {bullet.originalText && (
            <button
              type="button"
              onClick={() => revertBullet(jobId, bullet.id)}
              disabled={bullet.isImproving}
              className="flex items-center gap-1.5 rounded-lg bg-[#111118] border border-white/[0.06] px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#94a3b8] hover:text-[#f1f5f9] transition-all min-h-[44px]"
              title="Undo AI edit"
            >
              <Undo2 size={12} /> Revert
            </button>
          )}

          <button
            type="button"
            onClick={handleImprove}
            disabled={bullet.isImproving || !bullet.text.trim()}
            className="flex items-center gap-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all min-h-[44px]"
          >
            {bullet.isImproving ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Sparkles size={12} />
            )}
            {bullet.isImproving ? 'Improving...' : 'Improve'}
          </button>

          <button
            type="button"
            onClick={() => removeBullet(jobId, bullet.id)}
            disabled={bullet.isImproving}
            className="flex items-center justify-center rounded-lg p-2 min-h-[44px] min-w-[44px] text-[#94a3b8] hover:bg-red-500/10 hover:text-red-400 transition-all focus:outline-none"
            title="Delete bullet"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
