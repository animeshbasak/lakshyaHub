// src/features/resume-builder/data/sampleData.ts
import { ResumeData } from '@/types';

export type DemoPersonaKey = 'frontend-india' | 'designer-india';

export const DEMO_PERSONAS: Record<DemoPersonaKey, ResumeData> = {
  'frontend-india': {
    id: '',
    name: 'India Frontend Engineer Demo',
    template: 'harvard',
    header: {
      name: 'Aarav Kulkarni',
      title: 'Frontend Engineer · React · TypeScript · Next.js',
      email: 'aarav.kulkarni@email.com',
      phone: '+91 98765 43120',
      location: 'Bengaluru, Karnataka',
      linkedin: 'linkedin.com/in/aaravkulkarni',
      portfolio: 'aaravkulkarni.dev',
      github: 'github.com/aaravkulkarni'
    },
    summary: [
      'Frontend Engineer with 6 years of experience building high-traffic consumer and fintech products for the Indian market, with a focus on performance, experimentation, and conversion.',
      'Specialist in React, TypeScript, Next.js, and design systems, partnering closely with product, design, and analytics teams to ship measurable UX improvements.',
      'Known for improving page speed, making complex flows easier to use, and turning product requirements into ATS-friendly, outcome-led resume bullets.'
    ],
    skills: [
      { id: 'f-s1', category: 'Frontend', values: 'React, Next.js, TypeScript, JavaScript, HTML5, CSS3' },
      { id: 'f-s2', category: 'State & Data', values: 'Redux Toolkit, React Query, GraphQL, REST APIs' },
      { id: 'f-s3', category: 'Performance', values: 'Core Web Vitals, Lighthouse, bundle optimisation, code splitting' },
      { id: 'f-s4', category: 'Analytics', values: 'GA4, Mixpanel, A/B testing, event instrumentation' },
      { id: 'f-s5', category: 'Delivery', values: 'Design systems, Jest, Playwright, GitHub Actions, Vercel' }
    ],
    experience: [
      {
        id: 'f-e1',
        title: 'Senior Frontend Engineer',
        company: 'CRED · Bengaluru',
        period: 'Jan 2023 – Present',
        scale: 'Payments & Rewards · 15M+ monthly users',
        bullets: [
          { id: 'f-b1', text: 'Led the React and TypeScript rewrite of the card payments dashboard, cutting task completion time by **18%** across key repayment journeys.' },
          { id: 'f-b2', text: 'Improved landing and dashboard performance with Next.js SSR and image optimisation, reducing LCP from **3.4s** to **1.9s** on mid-range Android devices.' },
          { id: 'f-b3', text: 'Partnered with analytics and product teams to redesign funnel instrumentation, helping uncover onboarding drop-off points and lift activation by **11%**.' },
          { id: 'f-b4', text: 'Maintained a shared design system used by 4 squads, reducing duplicate UI work and lowering post-release visual regressions by **28%**.' }
        ]
      },
      {
        id: 'f-e2',
        title: 'Frontend Engineer',
        company: 'Razorpay · Bengaluru',
        period: 'Jun 2020 – Dec 2022',
        scale: 'Merchant Experience · 8L+ businesses',
        bullets: [
          { id: 'f-b5', text: 'Built merchant onboarding flows in React that improved completion rate by **13%** through clearer validation, better state management, and progressive disclosure.' },
          { id: 'f-b6', text: 'Introduced reusable TypeScript component patterns for dashboards and forms, reducing feature delivery time by **22%** across the frontend team.' },
          { id: 'f-b7', text: 'Shipped performance budgets and CI checks for key routes, preventing JavaScript bundle growth and keeping Lighthouse performance above **90**.' }
        ]
      }
    ],
    education: [
      {
        id: 'f-edu1',
        degree: 'B.E. Information Science',
        institution: 'PES University',
        period: '2014 – 2018',
        grade: '8.6 CGPA'
      }
    ],
    competencies: [
      'Frontend Architecture', 'Design Systems', 'Core Web Vitals', 'Experimentation',
      'Product Analytics', 'Accessibility', 'Cross-functional Collaboration', 'Performance Engineering'
    ]
  },
  'designer-india': {
    id: '',
    name: 'India Product Designer Demo',
    template: 'harvard',
    header: {
      name: 'Naina Batra',
      title: 'Product Designer · UX Systems · B2B SaaS',
      email: 'naina.batra@email.com',
      phone: '+91 98111 24018',
      location: 'Gurugram, Haryana',
      linkedin: 'linkedin.com/in/nainabatra',
      portfolio: 'nainabatra.design'
    },
    summary: [
      'Product Designer with 5 years of experience designing SaaS and consumer workflows for Indian tech teams, balancing user research, execution speed, and business outcomes.',
      'Experienced in Figma, design systems, UX writing, prototyping, and cross-functional discovery across onboarding, activation, retention, and workflow simplification problems.',
      'Known for turning ambiguous product problems into clear flows, trustworthy interfaces, and recruiter-friendly case studies grounded in measurable impact.'
    ],
    skills: [
      { id: 'd-s1', category: 'Core Design', values: 'Product Design, UX Design, Interaction Design, Information Architecture' },
      { id: 'd-s2', category: 'Research', values: 'User interviews, usability testing, journey mapping, JTBD synthesis' },
      { id: 'd-s3', category: 'Systems', values: 'Design systems, component documentation, UX writing, accessibility' },
      { id: 'd-s4', category: 'Tools', values: 'Figma, FigJam, Protopie, Maze, Miro' },
      { id: 'd-s5', category: 'Collaboration', values: 'Product strategy, stakeholder workshops, handoff with engineers, metrics review' }
    ],
    experience: [
      {
        id: 'd-e1',
        title: 'Senior Product Designer',
        company: 'Postman · Bengaluru',
        period: 'Feb 2023 – Present',
        scale: 'Collaboration Platform · Global API teams',
        bullets: [
          { id: 'd-b1', text: 'Redesigned workspace onboarding for new API teams, improving first-week activation by **16%** through clearer task sequencing and better empty states.' },
          { id: 'd-b2', text: 'Built reusable patterns for settings, tables, and side panels in the design system, cutting designer-to-engineer clarification cycles by **30%**.' },
        ]
      }
    ],
    education: [
      {
        id: 'd-edu1',
        degree: 'B.Des. Communication Design',
        institution: 'Symbiosis Institute of Design',
        period: '2014 – 2018',
        grade: '8.4 CGPA'
      }
    ],
    competencies: [
      'UX Strategy', 'Design Systems', 'Usability Testing', 'Workflow Simplification',
      'Cross-functional Facilitation', 'Prototype Validation', 'Accessibility', 'Case Study Storytelling'
    ]
  }
};

export const DEFAULT_DEMO_PERSONA: DemoPersonaKey = 'frontend-india';
export const SAMPLE_DATA: ResumeData = DEMO_PERSONAS[DEFAULT_DEMO_PERSONA];
