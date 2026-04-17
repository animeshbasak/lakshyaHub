import { useEffect, useState, useRef } from 'react';
import { useResumeStore } from '@/features/resume-builder/store/useResumeStore';

export const AUTOSAVE_KEY = 'lakshya_hub_autosave';
export const AUTOSAVE_AT_KEY = 'lakshya_hub_autosave_at';

const SNAPSHOT_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

export function useAutosave() {
  const state = useResumeStore();
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const initialLoadDone = useRef(false);
  const lastSnapshotAt = useRef<number>(0);

  useEffect(() => {
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      return;
    }

    setSaveStatus('saving');
    const handler = setTimeout(() => {
      try {
        state.saveToStorage();
        const now = new Date().toISOString();
        // Periodically auto-snapshot to history (every 5 min of active edits)
        const nowMs = Date.now();
        if (state.id && nowMs - lastSnapshotAt.current > SNAPSHOT_INTERVAL_MS) {
          lastSnapshotAt.current = nowMs;
          state.saveSnapshot();
        }
        // Also write a named autosave key for restore prompt
        try {
          localStorage.setItem(AUTOSAVE_KEY, JSON.stringify({
            header: state.header,
            summary: state.summary,
            skills: state.skills,
            experience: state.experience,
            education: state.education,
            competencies: state.competencies,
            template: state.template,
            name: state.name,
            referenceText: state.referenceText,
            importReview: state.importReview,
            isRefPanelCollapsed: state.isRefPanelCollapsed,
            resumeOrigin: state.resumeOrigin,
          }));
          localStorage.setItem(AUTOSAVE_AT_KEY, now);
        } catch (_) {
          // localStorage quota exceeded — fail silently
        }
        setSaveStatus('saved');
        setLastSavedTime(now);
      } catch (e) {
        console.error("Failed to save to localStorage. Quota exceeded?", e);
        setSaveStatus('saved');
      }
    }, 1500);

    return () => clearTimeout(handler);
  }, [
    state.header,
    state.summary,
    state.skills,
    state.experience,
    state.education,
    state.competencies,
    state.saveToStorage,
    state.template,
    state.name,
    state.referenceText,
    state.importReview,
    state.isRefPanelCollapsed,
    state.resumeOrigin,
  ]);

  return { saveStatus, lastSavedTime };
}
