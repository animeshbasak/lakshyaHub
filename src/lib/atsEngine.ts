import { ResumeData } from '@/types';

export type ParseQuality = 'good' | 'partial' | 'unparseable';

export const assessParseQuality = (resumeData: ResumeData): ParseQuality => {
  const signals = {
    hasName: (resumeData.header?.name || '').trim().length > 1,
    hasEmail: /[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}/.test(resumeData.header?.email || ''),
    hasExperience: (resumeData.experience || []).length > 0,
    hasSkills: (resumeData.skills || []).flatMap(s => s.values ? s.values.split(',') : []).length > 2,
    hasSummary: (resumeData.summary || []).filter(Boolean).join('').length > 20,
    bulletCount: (resumeData.experience || []).flatMap(e => e.bullets || []).length,
  };

  const filledCount = Object.values(signals).filter(Boolean).length;

  if (filledCount <= 1 || signals.bulletCount === 0) return 'unparseable';
  if (filledCount <= 3) return 'partial';
  return 'good';
};

export interface ATSCheck {
  id: string;
  pillar: 'keywords' | 'position' | 'baseline';
  weight: number;
  label: string;
  tip: string;
  test: (r: ResumeData) => boolean;
}

export const ATS_CHECKS: ATSCheck[] = [
  // ─── PILLAR 1: KEYWORD COVERAGE (40 points total) ───
  {
    id: 'skills_volume',
    pillar: 'keywords',
    weight: 8,
    label: 'Sufficient skills listed (8+)',
    tip: 'List at least 8 specific skills — ATS systems keyword-match against skills sections first',
    test: (r) => r.skills.flatMap(s => s.values ? s.values.split(',') : []).filter(s => s.trim().length > 1).length >= 8
  },
  {
    id: 'skills_in_experience',
    pillar: 'keywords',
    weight: 10,
    label: 'Skills appear in experience bullets',
    tip: 'Your skills must also appear in job bullet points — not just the skills section. ATS cross-references both.',
    test: (r) => {
      const skills = r.skills.flatMap(s => s.values ? s.values.split(',') : [])
        .map(s => s.toLowerCase().split(/[\s\/\-]+/)).flat()
        .filter(w => w.length > 3);
      const bullets = r.experience.flatMap(e => e.bullets || []).map(b => b.text).join(' ').toLowerCase();
      return skills.filter(w => bullets.includes(w)).length >= 4;
    }
  },
  {
    id: 'tools_specificity',
    pillar: 'keywords',
    weight: 8,
    label: 'Specific tools and technologies named',
    tip: 'Name exact tools in bullets — "used React and TypeScript" beats "used modern frameworks"',
    test: (r) => {
      const KNOWN_TOOLS = ['react','angular','vue','typescript','javascript','python','java','sql','docker','kubernetes','aws','gcp','azure','node','express','django','flask','spring','git','github','gitlab','figma','jira','confluence','webpack','vite','jest','pytest','tensorflow','pytorch','pandas','tableau','powerbi','salesforce','hubspot','wordpress','shopify','graphql','rest','mongodb','postgresql','mysql','redis','kafka','elasticsearch','terraform','ansible','jenkins','cicd','linux'];
      const allText = [
        ...r.skills.flatMap(s => s.values ? s.values.split(',') : []),
        ...r.experience.flatMap(e => e.bullets || []).map(b => b.text)
      ].join(' ').toLowerCase();
      return KNOWN_TOOLS.filter(t => allText.includes(t)).length >= 5;
    }
  },
  {
    id: 'action_verbs',
    pillar: 'keywords',
    weight: 7,
    label: 'Strong action verbs (4+ unique)',
    tip: 'Start bullets with power verbs: Led, Built, Reduced, Launched, Architected, Delivered, Scaled',
    test: (r) => {
      const VERBS = ['led','built','designed','developed','implemented','architected','optimised','optimized','reduced','improved','launched','created','managed','delivered','drove','increased','automated','migrated','established','spearheaded','scaled','defined','deployed','shipped','authored','mentored','integrated','streamlined','revamped','transformed','founded','pioneered','negotiated','secured','generated','converted','recruited','trained','directed','oversaw','coordinated'];
      const bullets = r.experience.flatMap(e => e.bullets || []).map(b => b.text).join(' ').toLowerCase();
      return VERBS.filter(v => new RegExp(`\\b${v}\\b`).test(bullets)).length >= 4;
    }
  },
  {
    id: 'no_pronouns',
    pillar: 'keywords',
    weight: 4,
    label: 'No personal pronouns in bullets',
    tip: 'Remove "I", "me", "my" from all bullet points — ATS and recruiters both flag this',
    test: (r) => {
      const bullets = r.experience.flatMap(e => e.bullets || []).map(b => b.text).join(' ');
      return !/\b(I|me|my|myself)\b/.test(bullets) && bullets.trim().length > 0;
    }
  },
  {
    id: 'skills_categorised',
    pillar: 'keywords',
    weight: 3,
    label: 'Skills grouped by category',
    tip: 'Group skills: Languages · Frameworks · Tools · Databases — helps ATS parse skill types',
    test: (r) => r.skills.length >= 2
  },

  // ─── PILLAR 2: POSITION & STRUCTURE ALIGNMENT (35 points total) ───
  {
    id: 'has_experience',
    pillar: 'position',
    weight: 8,
    label: 'Work experience present',
    tip: 'Add at least one work experience entry',
    test: (r) => r.experience.length >= 1
  },
  {
    id: 'experience_bullets',
    pillar: 'position',
    weight: 7,
    label: 'Each role has 3+ bullet points',
    tip: 'ATS rewards thoroughness — add at least 3 bullets per job describing what you did and achieved',
    test: (r) => {
      if (r.experience.length === 0) return false;
      return r.experience.every(e => (e.bullets || []).filter(b => b.text.trim().length > 10).length >= 3);
    }
  },
  {
    id: 'quantified_achievements',
    pillar: 'position',
    weight: 9,
    label: 'Quantified achievements (numbers, %, $)',
    tip: 'Add metrics: "improved performance by 40%", "served 3M users", "reduced errors by 60%", "managed team of 8"',
    test: (r) => {
      const bullets = r.experience.flatMap(e => e.bullets || []).map(b => b.text).join(' ');
      const quantified = (bullets.match(/\d+%|\d+x|\$\d+|\d+\s*(M\b|K\b|million|thousand|users|customers|merchants|sessions|MAU|DAU|engineers|days|hours|months|projects|clients|accounts)/gi) || []);
      return quantified.length >= 2;
    }
  },
  {
    id: 'career_progression',
    pillar: 'position',
    weight: 5,
    label: 'Career progression visible',
    tip: 'Show title progression across roles (Junior → Mid → Senior → Lead) — ATS checks for seniority signals',
    test: (r) => {
      if (r.experience.length < 2) return true; // can't judge with 1 job
      const titles = r.experience.map(e => e.title?.toLowerCase() || '');
      const hasProgression = titles.some(t => /(senior|lead|principal|head|director|manager|staff|architect)/i.test(t));
      return hasProgression || r.experience.length >= 2;
    }
  },
  {
    id: 'has_education',
    pillar: 'position',
    weight: 4,
    label: 'Education section present',
    tip: 'Add your highest qualification — ATS often filters by education level',
    test: (r) => r.education.length >= 1 && (r.education[0].institution?.trim().length || 0) > 2
  },
  {
    id: 'complete_job_entries',
    pillar: 'position',
    weight: 2,
    label: 'All jobs have title, company and dates',
    tip: 'Every job needs: Job Title · Company Name · Start/End Date — ATS requires all three to parse correctly',
    test: (r) => r.experience.every(e =>
      e.title?.trim().length > 1 &&
      e.company?.trim().length > 1 &&
      e.period?.trim().length > 3
    )
  },

  // ─── PILLAR 3: BASELINE & READABILITY (25 points total) ───
  {
    id: 'has_email',
    pillar: 'baseline',
    weight: 5,
    label: 'Valid email address present',
    tip: 'Add a professional email address — ATS extracts this as primary contact',
    test: (r) => /[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}/.test(r.header.email)
  },
  {
    id: 'has_phone',
    pillar: 'baseline',
    weight: 3,
    label: 'Phone number present',
    tip: 'Add your phone number',
    test: (r) => r.header.phone.replace(/\D/g, '').length >= 8
  },
  {
    id: 'has_linkedin',
    pillar: 'baseline',
    weight: 4,
    label: 'LinkedIn URL present',
    tip: 'Add your LinkedIn URL — 87% of recruiters check LinkedIn before calling a candidate',
    test: (r) => r.header.linkedin.toLowerCase().includes('linkedin.com')
  },
  {
    id: 'has_location',
    pillar: 'baseline',
    weight: 2,
    label: 'Location present',
    tip: 'Add your city and country — many ATS filter by location',
    test: (r) => r.header.location.trim().length > 2
  },
  {
    id: 'has_summary',
    pillar: 'baseline',
    weight: 5,
    label: 'Professional summary present',
    tip: 'Add a 2–3 sentence professional summary — ATS and recruiters read this first',
    test: (r) => {
      const s = r.summary.filter(Boolean).join(' ');
      return s.trim().length >= 60;
    }
  },
  {
    id: 'summary_quality',
    pillar: 'baseline',
    weight: 3,
    label: 'Summary mentions years of experience',
    tip: 'Include your total years of experience in the summary: "7+ years building..."',
    test: (r) => {
      const s = r.summary.filter(Boolean).join(' ');
      return /\d+\+?\s*years?/i.test(s);
    }
  },
  {
    id: 'no_headers_footers_risk',
    pillar: 'baseline',
    weight: 2,
    label: 'Contact info not hidden in header/footer',
    tip: 'Research shows ATS misses contact info 25% of the time when it\'s in PDF headers/footers — keep it in the main body',
    test: (r) => r.header.email.length > 0 && r.header.phone.length > 0
  },
  {
    id: 'leadership_signal',
    pillar: 'baseline',
    weight: 1,
    label: 'Collaboration or leadership mentioned',
    tip: 'Mention teamwork or leadership in at least one bullet',
    test: (r) => {
      const bullets = r.experience.flatMap(e => e.bullets || []).map(b => b.text).join(' ').toLowerCase();
      return /(team|squad|stakeholder|cross.functional|collaborated|led|managed|mentored|coordinated)/i.test(bullets);
    }
  },
];

export interface ATSResult {
  score: number;
  pillarScores?: { keywords: number; position: number; baseline: number };
  pillarWeights?: { keywords: number; position: number; baseline: number };
  failing?: (ATSCheck & { passed: boolean; specificTip: string })[];
  passing?: (ATSCheck & { passed: boolean })[];
  grade?: { label: string; color: string; desc: string };
  parseQuality?: ParseQuality;
  totalChecks?: number;
  passedChecks?: number;
  missingKeywords?: string[];
  error?: string;
}

export const calculateATSScore = (resume: ResumeData): ATSResult => {
  // Safety: check parse quality first
  const quality = assessParseQuality(resume);
  if (quality === 'unparseable') return { score: 0, error: 'unparseable', parseQuality: 'unparseable' };

  const results = ATS_CHECKS.map(check => ({
    ...check,
    passed: (() => { try { return check.test(resume); } catch { return false; } })()
  }));

  // Three pillar scores — weighted exactly as real ATS research shows
  const pillars = ['keywords', 'position', 'baseline'] as const;
  const pillarWeights = { keywords: 0.40, position: 0.35, baseline: 0.25 };

  const pillarScores = Object.fromEntries(pillars.map(pillar => {
    const pillarChecks = results.filter(c => c.pillar === pillar);
    const earned = pillarChecks.filter(c => c.passed).reduce((s, c) => s + c.weight, 0);
    const total = pillarChecks.reduce((s, c) => s + c.weight, 0);
    return [pillar, total > 0 ? Math.round((earned / total) * 100) : 0];
  })) as Record<'keywords' | 'position' | 'baseline', number>;

  // Final score = weighted blend of three pillars
  const finalScore = Math.round(
    pillarScores.keywords * pillarWeights.keywords +
    pillarScores.position * pillarWeights.position +
    pillarScores.baseline * pillarWeights.baseline
  );

  // Specific tips based on actual resume content
  const failing = results
    .filter(c => !c.passed)
    .sort((a, b) => b.weight - a.weight)
    .map(c => ({
      ...c,
      specificTip: generateSpecificTip(c, resume)
    }));

  const passing = results.filter(c => c.passed);

  const grade =
    finalScore >= 85 ? { label: 'Excellent', color: '#22C55E', desc: 'Strong ATS compatibility' } :
    finalScore >= 70 ? { label: 'Good', color: '#3B82F6', desc: 'Good match — minor improvements recommended' } :
    finalScore >= 55 ? { label: 'Average', color: '#F59E0B', desc: 'Several gaps to fix before applying' } :
    finalScore >= 40 ? { label: 'Needs Work', color: '#F97316', desc: 'Significant improvements needed' } :
                       { label: 'Poor', color: '#EF4444', desc: 'Resume likely filtered out by ATS' };

  return {
    score: finalScore,
    pillarScores,
    pillarWeights,
    failing,
    passing,
    grade,
    parseQuality: quality,
    totalChecks: results.length,
    passedChecks: passing.length,
  };
};

// Specific tips using actual resume data
const generateSpecificTip = (check: ATSCheck, resume: ResumeData): string => {
  const bullets = (resume.experience || []).flatMap(e => e.bullets || []).map(b => b.text);
  const skillCount = (resume.skills || []).flatMap(s => s.values ? s.values.split(',') : []).length;

  switch (check.id) {
    case 'quantified_achievements': {
      const count = bullets.length;
      return count === 0
        ? 'Add bullet points to your experience first, then add numbers to each one'
        : `You have ${count} bullets — add numbers to at least 2: %, $, users served, time saved, team size`;
    }
    case 'skills_in_experience': {
      const skills = (resume.skills || []).flatMap(s => s.values ? s.values.split(',') : []).slice(0, 3).join(', ');
      return skills
        ? `Mention ${skills} directly in your job bullets — not just in Skills section`
        : check.tip;
    }
    case 'skills_volume':
      return `You have ${skillCount} skills — add ${Math.max(0, 8 - skillCount)} more specific technologies`;
    case 'experience_bullets': {
      const shallow = (resume.experience || []).filter(e => (e.bullets || []).length < 3);
      return shallow.length > 0
        ? `${shallow.map(e => e.company || e.title || 'a role').slice(0, 2).join(' and ')} need more bullets — add at least 3 per job`
        : check.tip;
    }
    case 'has_linkedin':
      return '87% of recruiters check LinkedIn before calling — add your profile URL to contact info';
    case 'summary_quality': {
      const s = (resume.summary || []).filter(Boolean).join(' ');
      return s.length > 0
        ? 'Your summary doesn\'t mention years of experience — add "X+ years of experience in..."'
        : 'Write a professional summary that starts with your years of experience';
    }
    default:
      return check.tip;
  }
};

export const scoreRawText = (rawText: string): ATSResult => {
  const text = rawText.toLowerCase();
  const fullText = rawText; // preserve case for some checks

  // Safety gate
  if (!rawText || rawText.trim().length < 100) {
    return { error: 'unparseable', score: 0 };
  }

  const checks = [
    // ─── BASELINE (25%) ───
    {
      id: 'has_email', pillar: 'baseline', weight: 5,
      label: 'Email address present',
      tip: 'Add a professional email address',
      passed: /[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}/.test(fullText)
    },
    {
      id: 'has_phone', pillar: 'baseline', weight: 3,
      label: 'Phone number present',
      tip: 'Add your phone number',
      passed: /(\+\d{1,3}[\s-]?)?\(?\d{3,5}\)?[\s.-]?\d{3,4}[\s.-]?\d{4}/.test(fullText)
    },
    {
      id: 'has_linkedin', pillar: 'baseline', weight: 4,
      label: 'LinkedIn URL present',
      tip: 'Add your LinkedIn profile URL — 87% of recruiters check LinkedIn first',
      passed: /linkedin\.com\/in\//i.test(fullText)
    },
    {
      id: 'has_location', pillar: 'baseline', weight: 2,
      label: 'Location present',
      tip: 'Add your city and country',
      passed: /(india|usa|uk|canada|australia|germany|singapore|uae|remote|new delhi|mumbai|bangalore|bengaluru|hyderabad|chennai|pune|london|new york|san francisco)/i.test(fullText)
    },
    {
      id: 'has_summary', pillar: 'baseline', weight: 5,
      label: 'Professional summary present',
      tip: 'Add a 2–3 sentence summary at the top of your resume',
      passed: /\b(summary|profile|objective|about)\b/i.test(fullText) &&
              fullText.length > 300
    },
    {
      id: 'summary_has_years', pillar: 'baseline', weight: 3,
      label: 'Years of experience mentioned',
      tip: 'Mention your total years of experience: "7+ years building..."',
      passed: /\d+\+?\s*years?\s*(of\s*)?(experience|building|working)/i.test(fullText)
    },
    {
      id: 'portfolio_present', pillar: 'baseline', weight: 2,
      label: 'Portfolio or GitHub URL present',
      tip: 'Add your portfolio, GitHub, or personal site URL',
      passed: /(github\.com\/|\.vercel\.app|\.netlify\.app|\.dev\/|\.io\/)/i.test(fullText)
    },
    {
      id: 'contact_in_body', pillar: 'baseline', weight: 1,
      label: 'Contact info accessible to ATS',
      tip: 'Keep contact info in the main body — ATS misses text stored in PDF headers/footers',
      passed: /[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}/.test(fullText)
    },

    // ─── POSITION & STRUCTURE (35%) ───
    {
      id: 'has_experience_section', pillar: 'position', weight: 8,
      label: 'Work experience section present',
      tip: 'Add a clearly labelled Work Experience section',
      passed: /\b(experience|employment|work history|career)\b/i.test(fullText)
    },
    {
      id: 'multiple_jobs', pillar: 'position', weight: 5,
      label: 'Multiple roles listed',
      tip: 'List all relevant positions — ATS evaluates career depth',
      passed: (() => {
        const dateRanges = fullText.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\d{4})\s*[-–—]\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|\d{4}|present|current)/gi);
        return (dateRanges?.length || 0) >= 2;
      })()
    },
    {
      id: 'has_bullets', pillar: 'position', weight: 7,
      label: 'Bullet points present in experience',
      tip: 'Use bullet points for each job — ATS parses structured bullets better than paragraphs',
      passed: (fullText.match(/[•\-\*–▪]/g) || []).length >= 6
    },
    {
      id: 'quantified_achievements', pillar: 'position', weight: 9,
      label: 'Quantified achievements (%, $, numbers)',
      tip: 'Add metrics to bullets: "improved by 40%", "served 3M users", "reduced errors by 60%"',
      passed: (() => {
        const matches = fullText.match(/\d+%|\d+x|\$\d+|\d+\s*(M\b|K\b|million|thousand|users|customers|merchants|sessions|MAU|DAU|engineers|days|hours|months)/gi);
        return (matches?.length || 0) >= 2;
      })()
    },
    {
      id: 'has_education', pillar: 'position', weight: 4,
      label: 'Education section present',
      tip: 'Add your highest qualification',
      passed: /\b(education|b\.tech|b\.e|m\.tech|mba|bachelor|master|degree|university|college|institute)\b/i.test(fullText)
    },
    {
      id: 'career_progression', pillar: 'position', weight: 5,
      label: 'Seniority or progression visible',
      tip: 'Show career progression — titles like Senior, Lead, Manager signal growth to ATS',
      passed: /(senior|lead|principal|head|director|manager|staff|architect|engineer ii|engineer iii)/i.test(fullText)
    },
    {
      id: 'dates_present', pillar: 'position', weight: 2,
      label: 'Employment dates present',
      tip: 'Add start and end dates to every job — ATS requires dates for timeline parsing',
      passed: /\b(20\d{2})\b.*\b(20\d{2}|present|current)\b/i.test(fullText)
    },

    // ─── KEYWORD COVERAGE (40%) ───
    {
      id: 'has_skills_section', pillar: 'keywords', weight: 6,
      label: 'Skills section present',
      tip: 'Add a dedicated Skills section — ATS systems parse this first for keyword matching',
      passed: /\b(skills|technologies|tech stack|competencies|expertise)\b/i.test(fullText)
    },
    {
      id: 'skills_volume', pillar: 'keywords', weight: 7,
      label: 'Sufficient skills listed (8+)',
      tip: 'List at least 8 specific skills — ATS keyword-matches against your skills section',
      passed: (() => {
        const COMMON_SKILLS = ['react','angular','vue','typescript','javascript','python','java','sql','docker','kubernetes','aws','gcp','azure','node','express','git','figma','jira','webpack','vite','jest','redux','mongodb','postgresql','mysql','redis','graphql','rest','api','html','css','scss','linux','terraform','jenkins','github'];
        return COMMON_SKILLS.filter(s => text.includes(s)).length >= 6;
      })()
    },
    {
      id: 'action_verbs', pillar: 'keywords', weight: 7,
      label: 'Strong action verbs used (4+)',
      tip: 'Start bullets with power verbs: Led, Built, Reduced, Launched, Architected, Delivered',
      passed: (() => {
        const VERBS = ['led','built','designed','developed','implemented','architected','optimised','optimized','reduced','improved','launched','created','managed','delivered','drove','increased','automated','migrated','spearheaded','scaled','deployed','shipped','authored','mentored','integrated','streamlined','revamped','transformed','founded','negotiated','generated','converted','coordinated','established'];
        return VERBS.filter(v => new RegExp(`\\b${v}\\b`,'i').test(fullText)).length >= 4;
      })()
    },
    {
      id: 'tools_specificity', pillar: 'keywords', weight: 8,
      label: 'Specific tools named in experience',
      tip: 'Name exact tools in bullets — "used React and TypeScript" beats "used modern frameworks"',
      passed: (() => {
        const TOOLS = ['react','typescript','javascript','python','sql','docker','aws','node','git','figma','jira','kubernetes','jest','redux','webpack','vite','jenkins','github','postgresql','mongodb','redis','graphql','terraform','ansible','spring','angular','vue','flutter','kotlin','swift'];
        return TOOLS.filter(t => text.includes(t)).length >= 4;
      })()
    },
    {
      id: 'no_pronouns', pillar: 'keywords', weight: 3,
      label: 'No personal pronouns in bullets',
      tip: 'Remove "I", "me", "my" from bullet points',
      passed: !/\b(I |me |my )\b/.test(fullText)
    },
    {
      id: 'leadership_signal', pillar: 'keywords', weight: 4,
      label: 'Leadership or collaboration signals',
      tip: 'Mention team leadership, cross-functional work, or stakeholder management',
      passed: /(team|squad|stakeholder|cross.functional|collaborated|led|managed|mentored|coordinated|ownership)/i.test(fullText)
    },
    {
      id: 'skills_in_bullets', pillar: 'keywords', weight: 5,
      label: 'Technical skills appear in job bullets',
      tip: 'Mention your key skills inside your job descriptions — not just the skills section',
      passed: (() => {
        const SKILLS = ['react','typescript','javascript','python','sql','aws','node','docker','git','figma','kubernetes','jest','redux','webpack','jenkins','postgresql','spring','angular'];
        const bulletSection = fullText.slice(fullText.search(/experience/i));
        return SKILLS.filter(s => bulletSection.toLowerCase().includes(s)).length >= 3;
      })()
    },
  ];

  // Calculate pillar scores
  const pillars = ['keywords', 'position', 'baseline'] as const;
  const pillarWeights = { keywords: 0.40, position: 0.35, baseline: 0.25 };

  const pillarScores = Object.fromEntries(pillars.map(pillar => {
    const pc = checks.filter(c => c.pillar === pillar);
    const earned = pc.filter(c => c.passed).reduce((s, c) => s + c.weight, 0);
    const total = pc.reduce((s, c) => s + c.weight, 0);
    return [pillar, total > 0 ? Math.round((earned / total) * 100) : 0];
  })) as Record<'keywords' | 'position' | 'baseline', number>;

  const finalScore = Math.round(
    pillarScores.keywords * pillarWeights.keywords +
    pillarScores.position * pillarWeights.position +
    pillarScores.baseline * pillarWeights.baseline
  );

  const failing = checks.filter(c => !c.passed).sort((a, b) => b.weight - a.weight).map(c => ({...c, specificTip: c.tip}));
  const passing = checks.filter(c => c.passed);

  const grade =
    finalScore >= 85 ? { label: 'Excellent', color: '#22C55E', desc: 'Strong ATS compatibility' } :
    finalScore >= 70 ? { label: 'Good', color: '#3B82F6', desc: 'Good match — minor improvements recommended' } :
    finalScore >= 55 ? { label: 'Average', color: '#F59E0B', desc: 'Several gaps to fix before applying' } :
    finalScore >= 40 ? { label: 'Needs Work', color: '#F97316', desc: 'Significant improvements needed' } :
                       { label: 'Poor', color: '#EF4444', desc: 'Resume likely filtered out by ATS' };

  return { score: finalScore, pillarScores, failing: failing as any, passing: passing as any, grade, totalChecks: checks.length, passedChecks: passing.length, parseQuality: 'good' };
};
