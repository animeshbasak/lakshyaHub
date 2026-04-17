// src/features/resume-builder/store/useResumeStore.ts
import { create } from 'zustand';
import {
  ResumeData,
  SkillRow,
  JobEntry,
  ProjectEntry,
  TemplateType,
  Education,
  ResumeHeader,
  ResumeOrigin,
  BuilderImportReviewState,
} from '@/types';
import { DEFAULT_DEMO_PERSONA, DEMO_PERSONAS, DemoPersonaKey } from '../data/sampleData';

function cloneList<T>(value?: T[]) {
  return Array.isArray(value) ? structuredClone(value) : [];
}

function createSummary(summary?: string[]) {
  return [
    summary?.[0] ?? '',
    summary?.[1] ?? '',
    summary?.[2] ?? '',
  ] as ResumeData['summary'];
}

const getInitialState = (): ResumeData => {
  return {
    id: '',
    name: 'Untitled Resume',
    template: 'harvard',
    header: { name: '', title: '', email: '', phone: '', location: '', linkedin: '', portfolio: '' },
    summary: ['', '', ''],
    skills: [],
    experience: [],
    education: [],
    projects: [],
    competencies: [],
    referenceText: '',
    isRefPanelCollapsed: false,
    resumeOrigin: 'blank',
  };
};

interface ResumeStore extends ResumeData {
  // Extended state
  importReview?: BuilderImportReviewState;
  referenceText?: string;

  // Actions
  updateHeader: (field: keyof ResumeHeader, value: string) => void;
  updateSummaryLine: (index: number, value: string) => void;
  
  addSkillRow: () => void;
  updateSkillRow: (id: string, field: 'category' | 'values', value: string) => void;
  removeSkillRow: (id: string) => void;
  
  addJob: () => void;
  updateJob: (id: string, field: keyof Omit<JobEntry, 'bullets'>, value: string) => void;
  removeJob: (id: string) => void;
  
  addBullet: (jobId: string) => void;
  updateBullet: (jobId: string, bulletId: string, text: string) => void;
  removeBullet: (jobId: string, bulletId: string) => void;
  setBulletImproving: (jobId: string, bulletId: string, improving: boolean) => void;
  
  addEducation: () => void;
  updateEducation: (id: string, field: keyof Omit<Education, 'id'>, value: string) => void;
  removeEducation: (id: string) => void;
  
  addProject: (kind?: ProjectEntry['kind']) => void;
  updateProject: (id: string, field: keyof Omit<ProjectEntry, 'id' | 'technologies' | 'bullets'>, value: string | ProjectEntry['kind']) => void;
  removeProject: (id: string) => void;
  
  updateName: (name: string) => void;
  updateTemplate: (t: TemplateType) => void;

  loadExample: (personaKey?: DemoPersonaKey) => void;
  clearAll: () => void;
  setResumeData: (data: Partial<ResumeData>) => void;
  toggleRefPanel: () => void;

  // Import & storage actions
  applyImportedResume: (data: Partial<ResumeData>, importReview?: BuilderImportReviewState) => void;
  setImportReview: (review: BuilderImportReviewState | undefined) => void;
  setReferenceText: (text: string) => void;
  saveToStorage: () => void;
  loadFromStorage: () => boolean;
  saveSnapshot: (label?: string) => void;
  getSnapshots: () => Array<{ timestamp: number; label: string; data: ResumeData }>;
  restoreSnapshot: (timestamp: number) => void;
}

export const useResumeStore = create<ResumeStore>((set, get) => ({
  ...getInitialState(),

  updateHeader: (field, value) => 
    set((state) => ({ header: { ...state.header, [field]: value } })),

  updateSummaryLine: (index, value) =>
    set((state) => {
      const newSummary = [...state.summary];
      newSummary[index] = value;
      return { summary: newSummary };
    }),

  addSkillRow: () =>
    set((state) => ({
      skills: [...state.skills, { id: `s_${Date.now()}`, category: '', values: '' }]
    })),

  updateSkillRow: (id, field, value) =>
    set((state) => ({
      skills: state.skills.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    })),

  removeSkillRow: (id) =>
    set((state) => ({ skills: state.skills.filter((s) => s.id !== id) })),

  addJob: () =>
    set((state) => ({
      experience: [
        { id: `j_${Date.now()}`, title: '', company: '', period: '', scale: '', bullets: [] },
        ...state.experience
      ]
    })),

  updateJob: (id, field, value) =>
    set((state) => ({
      experience: state.experience.map((j) => (j.id === id ? { ...j, [field]: value } : j))
    })),

  removeJob: (id) =>
    set((state) => ({ experience: state.experience.filter((j) => j.id !== id) })),

  addBullet: (jobId) =>
    set((state) => ({
      experience: state.experience.map((j) => {
        if (j.id !== jobId) return j;
        return {
          ...j,
          bullets: [...j.bullets, { id: `b_${Date.now()}`, text: '' }]
        };
      })
    })),

  updateBullet: (jobId, bulletId, text) =>
    set((state) => ({
      experience: state.experience.map((j) => {
        if (j.id !== jobId) return j;
        return {
          ...j,
          bullets: j.bullets.map((b) => (b.id === bulletId ? { ...b, text } : b))
        };
      })
    })),

  removeBullet: (jobId, bulletId) =>
    set((state) => ({
      experience: state.experience.map((j) => {
        if (j.id !== jobId) return j;
        return {
          ...j,
          bullets: j.bullets.filter((b) => b.id !== bulletId)
        };
      })
    })),

  setBulletImproving: (jobId, bulletId, improving) =>
    set((state) => ({
      experience: state.experience.map((j) => {
        if (j.id !== jobId) return j;
        return {
          ...j,
          bullets: j.bullets.map((b) => (b.id === bulletId ? { ...b, isImproving: improving } : b))
        };
      })
    })),

  addEducation: () =>
    set((state) => ({
      education: [...state.education, { id: `e_${Date.now()}`, degree: '', institution: '', period: '', grade: '' }]
    })),
  
  updateEducation: (id, field, value) =>
    set((state) => ({
      education: state.education.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    })),
  
  removeEducation: (id) =>
    set((state) => ({ education: state.education.filter((e) => e.id !== id) })),

  addProject: (kind = 'project') =>
    set((state) => ({
      projects: [
        ...(state.projects ?? []),
        { id: `p_${Date.now()}`, name: '', period: '', description: '', technologies: [], link: '', bullets: [], kind },
      ],
    })),

  updateProject: (id, field, value) =>
    set((state) => ({
      projects: (state.projects ?? []).map((project) =>
        project.id === id ? { ...project, [field]: value } : project
      ),
    })),

  removeProject: (id) =>
    set((state) => ({ projects: (state.projects ?? []).filter((project) => project.id !== id) })),

  updateName: (name) => set({ name }),
  updateTemplate: (template) => set({ template }),

  loadExample: (personaKey = DEFAULT_DEMO_PERSONA) =>
    set((state) => ({
      ...getInitialState(),
      ...DEMO_PERSONAS[personaKey],
      id: state.id || `demo_${Date.now()}`,
      resumeOrigin: 'demo',
    })),

  clearAll: () => set(getInitialState()),

  setResumeData: (data) => set((state) => ({ ...state, ...data })),

  toggleRefPanel: () => set((state) => ({ isRefPanelCollapsed: !state.isRefPanelCollapsed })),

  applyImportedResume: (data, importReview) =>
    set((state) => ({
      ...state,
      ...data,
      importReview: importReview ?? state.importReview,
      resumeOrigin: 'imported' as ResumeOrigin,
      id: state.id || `imported_${Date.now()}`,
    })),

  setImportReview: (review) => set({ importReview: review }),

  setReferenceText: (text) => set({ referenceText: text }),

  saveToStorage: () => {
    try {
      const state = useResumeStore.getState();
      const data: ResumeData = {
        id: state.id,
        name: state.name,
        template: state.template,
        header: state.header,
        summary: state.summary,
        skills: state.skills,
        experience: state.experience,
        education: state.education,
        projects: state.projects,
        competencies: state.competencies,
        referenceText: state.referenceText,
        isRefPanelCollapsed: state.isRefPanelCollapsed,
        importReview: state.importReview,
        resumeOrigin: state.resumeOrigin,
      };
      localStorage.setItem('lakshya_hub_resume_v1', JSON.stringify(data));
    } catch (_) {
      // localStorage quota exceeded — fail silently
    }
  },

  loadFromStorage: () => {
    try {
      const raw = localStorage.getItem('lakshya_hub_resume_v1');
      if (!raw) return false;
      const data = JSON.parse(raw) as ResumeData;
      useResumeStore.getState().setResumeData(data);
      return true;
    } catch (_) {
      return false;
    }
  },

  saveSnapshot: (label) => {
    try {
      const state = useResumeStore.getState();
      const data: ResumeData = {
        id: state.id,
        name: state.name,
        template: state.template,
        header: state.header,
        summary: state.summary,
        skills: state.skills,
        experience: state.experience,
        education: state.education,
        projects: state.projects,
        competencies: state.competencies,
        referenceText: state.referenceText,
        isRefPanelCollapsed: state.isRefPanelCollapsed,
        importReview: state.importReview,
        resumeOrigin: state.resumeOrigin,
      };
      const raw = localStorage.getItem('lakshya_hub_snaps_v1');
      const snaps: Array<{ timestamp: number; label: string; data: ResumeData }> = raw
        ? JSON.parse(raw)
        : [];
      snaps.unshift({ timestamp: Date.now(), label: label ?? 'Auto', data });
      if (snaps.length > 20) snaps.length = 20;
      localStorage.setItem('lakshya_hub_snaps_v1', JSON.stringify(snaps));
    } catch (_) {
      // fail silently
    }
  },

  getSnapshots: () => {
    try {
      const raw = localStorage.getItem('lakshya_hub_snaps_v1');
      return raw ? JSON.parse(raw) : [];
    } catch (_) {
      return [];
    }
  },

  restoreSnapshot: (timestamp) => {
    try {
      const raw = localStorage.getItem('lakshya_hub_snaps_v1');
      const snaps: Array<{ timestamp: number; label: string; data: ResumeData }> = raw
        ? JSON.parse(raw)
        : [];
      const snap = snaps.find((s) => s.timestamp === timestamp);
      if (snap) {
        useResumeStore.getState().setResumeData(snap.data);
      }
    } catch (_) {
      // fail silently
    }
  },
}));
