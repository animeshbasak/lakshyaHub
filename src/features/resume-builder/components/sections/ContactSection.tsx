'use client'
import React from 'react';
import { User, AlertTriangle } from 'lucide-react';
import { useResumeStore } from '@/features/resume-builder/store/useResumeStore';

export function ContactSection() {
  const { header, updateHeader } = useResumeStore();
  const auditFailures: string[] = [];

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateHeader(e.target.name as any, e.target.value);
  };

  return (
    <section className="space-y-6">
      <div className="space-y-3 border-b border-white/[0.06] pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] text-white">
            <User size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/40">Editor</p>
            <h3 className="text-xl font-bold tracking-tight text-[#f1f5f9]">Contact Info</h3>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm text-[#94a3b8]">
          <p className="break-words leading-relaxed">Name, title, location, and the links recruiters scan first.</p>
          {(auditFailures?.includes('no_portfolio') || auditFailures?.includes('no_linkedin')) && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/16 bg-amber-400/8 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-amber-200/85">
              <AlertTriangle size={12} />
              Add LinkedIn or portfolio
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label htmlFor="full-name" className="mb-2 ml-1 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#94a3b8]">Full Name</label>
          <input
            id="full-name"
            type="text"
            name="name"
            value={header.name}
            onChange={handleInput}
            className="w-full rounded-xl border border-white/[0.06] bg-[#1a1a24] px-4 py-3 text-sm text-[#f1f5f9] placeholder:text-[#94a3b8]/50 outline-none transition-all break-words focus:border-white/25 focus:ring-2 focus:ring-white/10"
            placeholder="e.g. Rahul Sharma"
          />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="job-title" className="mb-2 ml-1 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#94a3b8]">Professional Title</label>
          <input
            id="job-title"
            type="text"
            name="title"
            value={header.title}
            onChange={handleInput}
            className="w-full rounded-xl border border-white/[0.06] bg-[#1a1a24] px-4 py-3 text-sm text-[#f1f5f9] placeholder:text-[#94a3b8]/50 outline-none transition-all break-words focus:border-white/25 focus:ring-2 focus:ring-white/10"
            placeholder="e.g. SDE II / Senior Software Engineer"
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-2 ml-1 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#94a3b8]">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            value={header.email}
            onChange={handleInput}
            className="w-full rounded-xl border border-white/[0.06] bg-[#1a1a24] px-4 py-3 text-sm text-[#f1f5f9] placeholder:text-[#94a3b8]/50 outline-none transition-all break-words focus:border-white/25 focus:ring-2 focus:ring-white/10"
            placeholder="rahul.sharma@gmail.com"
          />
        </div>
        <div>
          <label htmlFor="phone" className="mb-2 ml-1 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#94a3b8]">Phone</label>
          <input
            id="phone"
            type="text"
            name="phone"
            value={header.phone}
            onChange={handleInput}
            className="w-full rounded-xl border border-white/[0.06] bg-[#1a1a24] px-4 py-3 text-sm text-[#f1f5f9] placeholder:text-[#94a3b8]/50 outline-none transition-all break-words focus:border-white/25 focus:ring-2 focus:ring-white/10"
            placeholder="+91 98765 43210"
          />
        </div>
        <div>
          <label htmlFor="location" className="mb-2 ml-1 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#94a3b8]">Location</label>
          <input
            id="location"
            type="text"
            name="location"
            value={header.location}
            onChange={handleInput}
            className="w-full rounded-xl border border-white/[0.06] bg-[#1a1a24] px-4 py-3 text-sm text-[#f1f5f9] placeholder:text-[#94a3b8]/50 outline-none transition-all break-words focus:border-white/25 focus:ring-2 focus:ring-white/10"
            placeholder="Bengaluru, KA"
          />
        </div>
        <div>
          <label htmlFor="linkedin" className="mb-2 ml-1 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#94a3b8]">LinkedIn URL</label>
          <input
            id="linkedin"
            type="text"
            name="linkedin"
            value={header.linkedin}
            onChange={handleInput}
            className="w-full rounded-xl border border-white/[0.06] bg-[#1a1a24] px-4 py-3 text-sm text-[#f1f5f9] placeholder:text-[#94a3b8]/50 outline-none transition-all break-words focus:border-white/25 focus:ring-2 focus:ring-white/10"
            placeholder="linkedin.com/in/username"
          />
        </div>
        <div>
          <label htmlFor="portfolio" className="mb-2 ml-1 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#94a3b8]">Portfolio URL</label>
          <input
            id="portfolio"
            type="text"
            name="portfolio"
            value={header.portfolio}
            onChange={handleInput}
            className="w-full rounded-xl border border-white/[0.06] bg-[#1a1a24] px-4 py-3 text-sm text-[#f1f5f9] placeholder:text-[#94a3b8]/50 outline-none transition-all break-words focus:border-white/25 focus:ring-2 focus:ring-white/10"
            placeholder="johndoe.com"
          />
        </div>
        <div>
          <label htmlFor="github" className="mb-2 ml-1 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#94a3b8]">GitHub URL</label>
          <input
            id="github"
            type="text"
            name="github"
            value={header.github || ''}
            onChange={handleInput}
            className="w-full rounded-xl border border-white/[0.06] bg-[#1a1a24] px-4 py-3 text-sm text-[#f1f5f9] placeholder:text-[#94a3b8]/50 outline-none transition-all focus:border-white/25 focus:ring-2 focus:ring-white/10"
            placeholder="github.com/username"
          />
        </div>
      </div>
    </section>
  );
}
