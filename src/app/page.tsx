// src/app/page.tsx
'use client'
import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight, Briefcase, FileText, Zap, Shield, Target, Globe } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg text-white overflow-x-hidden selection:bg-cyan-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-8 py-6 flex items-center justify-between backdrop-blur-md bg-bg/50 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-500 shadow-lg shadow-cyan-500/20" />
          <span className="text-xl font-bold tracking-tight">Lakshya<span className="text-cyan-400">Hub</span></span>
        </div>
        <div className="flex items-center gap-8">
          <Link href="/board" className="text-sm font-medium text-text-muted hover:text-white transition-colors">Features</Link>
          <Link href="/resume" className="text-sm font-medium text-text-muted hover:text-white transition-colors">Resume</Link>
          <Link href="/board" className="px-5 py-2.5 rounded-xl bg-white text-bg text-sm font-bold hover:scale-[1.05] active:scale-[0.95] transition-all">
            Dashboard
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-8 flex flex-col items-center text-center">
        {/* Background Glows */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-[10px] font-bold uppercase tracking-widest mb-8 border border-cyan-500/20">
            <Sparkles className="w-3 h-3" />
            The Unified Career Command Center
          </div>
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 leading-[1.05]">
            Land your dream job. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400">Systematically.</span>
          </h1>
          <p className="text-xl text-text-muted max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Merge recruitment tracking with high-conversion AI resume building. 
            Automate the friction, focus on the interview.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/board" className="px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold text-lg shadow-xl shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2">
              Get Started for Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/resume" className="px-8 py-4 rounded-2xl bg-white/5 border border-white/5 text-white font-bold text-lg hover:bg-white/10 transition-all">
              Build My Resume
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureCard 
            icon={Target}
            title="Lakshya Board"
            description="Drag-and-drop Kanban to track every application from applied to offer."
          />
          <FeatureCard 
            icon={Sparkles}
            title="AI Resume"
            description="Optimize every bullet point with AI to beat ATS and impress recruiters."
          />
          <FeatureCard 
            icon={Zap}
            title="Job Matcher"
            description="Analyze how well your resume fits a JD and close the gap instantly."
          />
          <FeatureCard 
            icon={Shield}
            title="Supabase SSR"
            description="Secure, fast, and synced data across your devices automatically."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 px-8 flex flex-col md:flex-row items-center justify-between text-text-muted text-sm gap-8">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 rounded bg-white/10" />
          <span className="font-bold text-white">LakshyaHub</span>
        </div>
        <p>© 2026 Lakshya Hub Project. MIT Licensed.</p>
        <div className="flex gap-8">
          <a href="#" className="hover:text-white transition-all">GitHub</a>
          <a href="#" className="hover:text-white transition-all">Privacy</a>
          <a href="#" className="hover:text-white transition-all">Terms</a>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, description }: any) {
  return (
    <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/20 hover:bg-white/[0.04] transition-all group">
      <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition-transform">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-bold text-white mb-3 tracking-tight">{title}</h3>
      <p className="text-sm text-text-muted leading-relaxed">
        {description}
      </p>
    </div>
  )
}
