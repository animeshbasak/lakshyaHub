// src/features/resume-builder/components/StarterExperience.tsx
'use client'
import React, { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, FileUp, PenSquare, Sparkles } from 'lucide-react'
import { DemoPersonaKey } from '../data/sampleData'
import { parseResumeFile } from '@/lib/resumeImport/pipeline'
import { useResumeStore } from '../store/useResumeStore'

type UploadStage = 'idle' | 'uploading' | 'extracting' | 'structuring' | 'done' | 'error'

interface StarterExperienceProps {
  onLoadExample: (persona?: DemoPersonaKey) => void
  onBuildFromScratch: () => void
  onUpload: () => void
}

export function StarterExperience({ onLoadExample, onBuildFromScratch, onUpload }: StarterExperienceProps) {
  const applyImportedResume = useResumeStore((s) => s.applyImportedResume)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadStage, setUploadStage] = useState<UploadStage>('idle')
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError(null)
    setUploadStage('uploading')
    try {
      setUploadStage('extracting')
      const result = await parseResumeFile(file)
      setUploadStage('structuring')
      const { mapParsedResumeToBuilder } = await import('@/lib/resumeImport/pipeline')
      const payload = mapParsedResumeToBuilder(result)
      applyImportedResume(
        {
          header: payload.header,
          summary: payload.summary,
          experience: payload.experience,
          education: payload.education,
          projects: payload.projects,
          skills: payload.skills,
          competencies: payload.competencies,
          referenceText: payload.referenceText,
        },
        payload.importReview
      )
      setUploadStage('done')
      onUpload()
    } catch (err) {
      setUploadStage('error')
      setUploadError(err instanceof Error ? err.message : 'Could not parse resume. Try a different file.')
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const uploadLabel =
    uploadStage === 'uploading' ? 'Uploading...' :
    uploadStage === 'extracting' ? 'Extracting text...' :
    uploadStage === 'structuring' ? 'Structuring resume...' :
    uploadStage === 'done' ? 'Done!' :
    uploadStage === 'error' ? 'Upload failed' :
    'Import Resume'
  return (
    <div className="max-w-4xl mx-auto py-20 px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 text-white text-[10px] font-bold uppercase tracking-widest mb-6 border border-white/10">
          <Sparkles className="w-3 h-3" />
          Powered by AI
        </div>
        <h1 className="text-5xl font-bold text-white mb-6">Create a resume that <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">actually works</span></h1>
        <p className="text-lg text-text-muted max-w-2xl mx-auto">
          Choose a starting point to begin building your industry-standard resume. 
          Use our AI to optimize bullets and match job descriptions.
        </p>
      </motion.div>

      {uploadError && (
        <div className="mb-4 text-center text-sm text-red-400">{uploadError}</div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.doc,.docx"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StartingCard
          icon={FileUp}
          title={uploadLabel}
          description="Upload your current PDF or DOCX and we'll parse it for you."
          color="bright"
          onClick={handleUploadClick}
          disabled={uploadStage !== 'idle' && uploadStage !== 'error'}
        />
        <StartingCard 
          icon={Sparkles}
          title="Load Example"
          description="Start with a pre-filled template to see how it works."
          color="muted"
          onClick={() => onLoadExample()}
        />
        <StartingCard 
          icon={PenSquare}
          title="New from Scratch"
          description="Start with a blank slate and build it your way."
          color="slate"
          onClick={onBuildFromScratch}
        />
      </div>
    </div>
  )
}

function StartingCard({ icon: Icon, title, description, color, onClick, disabled }: any) {
  const colors: any = {
    bright: "from-white/20 to-white/[0.03] hover:border-white/20 text-white",
    muted: "from-white/10 to-white/[0.03] hover:border-white/20 text-white/90",
    slate: "from-white/10 to-white/5 hover:border-white/20 text-white"
  }

  return (
    <motion.button
      whileHover={disabled ? {} : { y: -5 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`relative group flex flex-col items-center text-center p-8 rounded-3xl border border-white/5 bg-gradient-to-b ${colors[color]} transition-all overflow-hidden ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
    >
      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/5 group-hover:scale-110 transition-transform">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-sm text-text-muted leading-relaxed">
        {description}
      </p>
      <div className="mt-8 opacity-0 group-hover:opacity-100 transition-opacity">
         <ArrowRight className="w-6 h-6" />
      </div>
    </motion.button>
  )
}
