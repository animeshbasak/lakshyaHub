// src/features/resume-builder/templates/index.ts
import React from 'react';
import { TemplateType, ResumeData } from '@/types';
import { HarvardTemplate } from './HarvardTemplate';
import { ModernTemplate } from './ModernTemplate';
import { ModernBlueTemplate } from './ModernBlueTemplate';
import { ExecutiveTemplate } from './ExecutiveTemplate';
import { MinimalTemplate } from './MinimalTemplate';
import { FAANGTemplate } from './FAANGTemplate';
import { TealSidebarTemplate } from './TealSidebarTemplate';
import { CompactProTemplate } from './CompactProTemplate';
import { WarmSerifTemplate } from './WarmSerifTemplate';
import { DarkHeaderTemplate } from './DarkHeaderTemplate';
import { IndiaTechTemplate } from './IndiaTechTemplate';
import { ClassicTemplate } from './ClassicTemplate';
import { CreativeTemplate } from './CreativeTemplate';

export const TEMPLATE_COMPONENTS: Record<string, React.ComponentType<{ data: ResumeData }>> = {
  'harvard': HarvardTemplate,
  'modern': ModernTemplate,
  'modern-blue': ModernBlueTemplate,
  'executive': ExecutiveTemplate,
  'minimal': MinimalTemplate,
  'faang': FAANGTemplate,
  'teal-sidebar': TealSidebarTemplate,
  'compact-pro': CompactProTemplate,
  'warm-serif': WarmSerifTemplate,
  'dark-header': DarkHeaderTemplate,
  'india-tech': IndiaTechTemplate,
  // Not yet in TemplateType — port complete, add to types/index.ts when ready
  'classic': ClassicTemplate,
  'creative': CreativeTemplate,
};

export const TEMPLATE_NAMES: Record<string, string> = {
  'harvard': 'Harvard',
  'modern': 'Modern',
  'modern-blue': 'Modern Blue',
  'executive': 'Executive',
  'minimal': 'Minimal',
  'faang': 'FAANG',
  'teal-sidebar': 'Teal Sidebar',
  'compact-pro': 'Compact Pro',
  'warm-serif': 'Warm Serif',
  'dark-header': 'Dark Header',
  'india-tech': 'India Tech',
  'classic': 'Classic',
  'creative': 'Creative',
};

export const TEMPLATE_LIST = Object.keys(TEMPLATE_NAMES) as TemplateType[];
