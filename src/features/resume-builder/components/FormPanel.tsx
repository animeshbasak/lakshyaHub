'use client'
import React from 'react';
import {
  ChevronDown,
  ChevronUp,
  Contact2,
  AlignLeft,
  Briefcase,
  GraduationCap,
  Wrench,
  Target,
  Boxes,
} from 'lucide-react';
import { ContactSection } from './sections/ContactSection';
import { SummarySection } from './sections/SummarySection';
import { SkillsSection } from './sections/SkillsSection';
import { ExperienceSection } from './sections/ExperienceSection';
import { EducationSection } from './sections/EducationSection';
import { CompetenciesSection } from './sections/CompetenciesSection';
import { ProjectsSection } from './sections/ProjectsSection';
import { useResumeStore } from '@/features/resume-builder/store/useResumeStore';

type EditorSectionKey =
  | 'contact'
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'competencies';

const MAX_EXPANDED_SECTIONS = 2;

const NAV_SECTIONS: Array<{
  key: EditorSectionKey;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}> = [
  { key: 'contact', label: 'Contact', icon: Contact2 },
  { key: 'summary', label: 'Summary', icon: AlignLeft },
  { key: 'experience', label: 'Experience', icon: Briefcase },
  { key: 'education', label: 'Education', icon: GraduationCap },
  { key: 'skills', label: 'Skills', icon: Wrench },
  { key: 'projects', label: 'Projects', icon: Boxes },
  { key: 'competencies', label: 'Competencies', icon: Target },
];

const EDITOR_SECTIONS: Array<{
  key: EditorSectionKey;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  render: () => React.ReactNode;
}> = [
  {
    key: 'contact',
    title: 'Contact Info',
    description: 'Name, role, links, and the basics recruiters scan first.',
    icon: Contact2,
    render: () => <ContactSection />,
  },
  {
    key: 'summary',
    title: 'Professional Summary',
    description: 'A sharp opening snapshot of your value and focus areas.',
    icon: AlignLeft,
    render: () => <SummarySection />,
  },
  {
    key: 'experience',
    title: 'Work Experience',
    description: 'Your strongest impact stories, metrics, and recruiter-facing bullets.',
    icon: Briefcase,
    render: () => <ExperienceSection />,
  },
  {
    key: 'education',
    title: 'Education',
    description: 'Degrees, institutions, dates, and academic proof points.',
    icon: GraduationCap,
    render: () => <EducationSection />,
  },
  {
    key: 'skills',
    title: 'Technical Skills',
    description: 'Your stack, grouped cleanly for ATS matching and quick scanning.',
    icon: Wrench,
    render: () => <SkillsSection />,
  },
  {
    key: 'projects',
    title: 'Side Projects & AI Builds',
    description: 'Products, side builds, and live AI work that should stay structured and editable.',
    icon: Boxes,
    render: () => <ProjectsSection />,
  },
  {
    key: 'competencies',
    title: 'Core Competencies',
    description: 'Focused keywords and strengths that reinforce the role fit.',
    icon: Target,
    render: () => <CompetenciesSection />,
  },
];

export function FormPanel() {
  const { importReview } = useResumeStore();
  const [expandedSections, setExpandedSections] = React.useState<EditorSectionKey[]>(['contact']);
  const sectionRefs = React.useRef<Record<EditorSectionKey, HTMLDivElement | null>>(
    {} as Record<EditorSectionKey, HTMLDivElement | null>
  );

  React.useEffect(() => {
    if (importReview) {
      setExpandedSections(['contact', 'experience']);
    }
  }, [importReview]);

  const reviewBadgeMap = React.useMemo(() => {
    const entries = importReview?.reviewBadges ?? [];
    return new Map(entries.map((badge) => [badge.section, badge]));
  }, [importReview]);

  const toggleSection = (sectionKey: EditorSectionKey) => {
    setExpandedSections((current) => {
      if (current.includes(sectionKey)) {
        return current.filter((key) => key !== sectionKey);
      }
      const next = [...current, sectionKey];
      if (next.length <= MAX_EXPANDED_SECTIONS) return next;
      return next.slice(next.length - MAX_EXPANDED_SECTIONS);
    });
  };

  const scrollToSection = (key: EditorSectionKey) => {
    // Ensure the section is expanded first
    setExpandedSections((current) => {
      if (current.includes(key)) return current;
      const next = [...current, key];
      if (next.length <= MAX_EXPANDED_SECTIONS) return next;
      return next.slice(next.length - MAX_EXPANDED_SECTIONS);
    });
    // Scroll after a tick to allow DOM update
    setTimeout(() => {
      const el = sectionRefs.current[key];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-transparent">
      {/* Sticky section nav */}
      <div className="sticky top-0 z-20 flex-shrink-0 overflow-x-auto border-b border-white/[0.06] bg-[#111118]/95 backdrop-blur-sm">
        <div className="flex min-w-max gap-1 px-4 py-2">
          {NAV_SECTIONS.map(({ key, label, icon: Icon }) => {
            const isActive = expandedSections.includes(key);
            return (
              <button
                key={key}
                onClick={() => scrollToSection(key)}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] transition-all min-h-[44px] whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                    : 'text-[#94a3b8] border border-transparent hover:bg-white/[0.04] hover:text-[#f1f5f9]'
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-none space-y-3.5 p-4 pb-40 md:p-5 lg:p-6">
          <div className="mb-2 flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
                Editor Sections
              </p>
              <p className="mt-1 text-sm leading-relaxed text-[#94a3b8]">
                Keep one or two sections open while you work.
              </p>
            </div>
            <span className="shrink-0 rounded-full border border-white/[0.06] bg-white/[0.025] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#94a3b8]">
              {expandedSections.length} open
            </span>
          </div>

          {EDITOR_SECTIONS.map((section) => {
            const isExpanded = expandedSections.includes(section.key);
            const Icon = section.icon;
            const reviewBadge = reviewBadgeMap.get(section.key);

            if (!isExpanded) {
              return (
                <button
                  key={section.key}
                  id={section.key}
                  ref={(el) => { sectionRefs.current[section.key] = el as HTMLDivElement | null; }}
                  onClick={() => toggleSection(section.key)}
                  className="flex w-full items-start justify-between gap-4 rounded-[14px] border border-white/[0.06] bg-[#111118] px-4 py-3.5 text-left transition-all hover:border-white/10 hover:bg-white/[0.03]"
                >
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.04] text-cyan-400/90">
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-[15px] font-black tracking-tight text-[#f1f5f9]">
                          {section.title}
                        </p>
                        {reviewBadge && (
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.16em] ${
                              reviewBadge.confidence === 'low'
                                ? 'border-rose-400/16 bg-rose-400/8 text-rose-200/85'
                                : 'border-amber-400/16 bg-amber-400/8 text-amber-200/85'
                            }`}
                          >
                            Review
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-[#94a3b8]">
                        {section.description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-1 flex shrink-0 items-center gap-2 text-[#94a3b8]">
                    <span className="text-[10px] font-black uppercase tracking-[0.18em]">Open</span>
                    <ChevronDown size={16} />
                  </div>
                </button>
              );
            }

            return (
              <div
                key={section.key}
                id={section.key}
                ref={(el) => { sectionRefs.current[section.key] = el; }}
                className="relative rounded-[14px] border border-white/[0.06] bg-[#111118] p-4"
              >
                <button
                  onClick={() => toggleSection(section.key)}
                  className="absolute right-4 top-4 z-10 inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-black/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#94a3b8] transition-colors hover:text-[#f1f5f9] min-h-[44px]"
                  aria-label={`Collapse ${section.title}`}
                >
                  Collapse
                  <ChevronUp size={14} />
                </button>
                {reviewBadge && (
                  <div className="mb-4 flex flex-wrap gap-2 pr-24">
                    <span
                      className={`rounded-full border px-3 py-1 text-[9px] font-black uppercase tracking-[0.16em] ${
                        reviewBadge.confidence === 'low'
                          ? 'border-rose-400/16 bg-rose-400/8 text-rose-200/85'
                          : 'border-amber-400/16 bg-amber-400/8 text-amber-200/85'
                      }`}
                    >
                      Needs review
                    </span>
                    <span className="min-w-0 break-words text-[11px] leading-relaxed text-[#94a3b8]">
                      {reviewBadge.message}
                    </span>
                  </div>
                )}
                {section.render()}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
