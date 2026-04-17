// src/app/(dashboard)/resume/page.tsx
'use client'
import { useEffect, useState, useTransition, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Save, Sparkles, Layers, Upload, Loader2 } from 'lucide-react'
import { useResumeStore } from '@/features/resume-builder/store/useResumeStore'
import { useAutosave } from '@/hooks/useAutosave'
import { FormPanel } from '@/features/resume-builder/components/FormPanel'
import { PreviewPanel } from '@/features/resume-builder/components/PreviewPanel'
import { StarterExperience } from '@/features/resume-builder/components/StarterExperience'
import { TemplatePicker } from '@/features/resume-builder/components/TemplatePicker'
import { PDFDownloadButton } from '@/features/resume-builder/components/PDFDownloadButton'
import { saveAndSyncProfile } from '@/actions/resumeActions'
import { toast } from 'sonner'
import { AIPanel } from '@/features/resume-builder/components/AIPanel'

// Inner component isolates useSearchParams so parent can wrap in <Suspense>
function ResumePageContent() {
  const store = useResumeStore()
  const searchParams = useSearchParams()
  const jdId = searchParams.get('jd_id')

  const { saveStatus } = useAutosave()

  const [hydrated, setHydrated] = useState(false)
  const [showTemplatePicker, setShowTemplatePicker] = useState(false)
  const [isSaving, startSavingTransition] = useTransition()
  const [isImporting, setIsImporting] = useState(false)
  const importFileRef = useRef<HTMLInputElement>(null)

  // Load from localStorage on mount (hydrate store)
  useEffect(() => {
    store.loadFromStorage()
    setHydrated(true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isBlank =
    !store.id && !store.header.name && store.experience.length === 0

  const handleUploadClick = () => {
    // Store update from applyImportedResume triggers re-render, making isBlank false
  }

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setIsImporting(true)
    try {
      const { parseResumeFile, mapParsedResumeToBuilder } = await import('@/lib/resumeImport/pipeline')
      const result = await parseResumeFile(file)
      const payload = mapParsedResumeToBuilder(result)
      store.applyImportedResume(
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
      toast.success('Resume imported!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not parse resume.')
    } finally {
      setIsImporting(false)
    }
  }

  const handleSave = () => {
    startSavingTransition(async () => {
      try {
        const data = {
          id: store.id,
          name: store.name,
          template: store.template,
          header: store.header,
          summary: store.summary,
          skills: store.skills,
          experience: store.experience,
          education: store.education,
          projects: store.projects,
          competencies: store.competencies,
          referenceText: store.referenceText,
          isRefPanelCollapsed: store.isRefPanelCollapsed,
          importReview: store.importReview,
          resumeOrigin: store.resumeOrigin,
        }
        await saveAndSyncProfile(data)
        toast.success('Resume saved!')
      } catch (err) {
        toast.error('Failed to save. Please try again.')
        console.error(err)
      }
    })
  }

  // Don't render until hydration complete to avoid localStorage flash
  if (!hydrated) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-cyan-500/20 border-t-cyan-500 animate-spin" />
          <span className="text-xs text-text-muted font-mono tracking-widest uppercase">Loading resume...</span>
        </div>
      </div>
    )
  }

  if (isBlank) {
    return (
      <div className="flex-1 bg-bg overflow-y-auto">
        <StarterExperience
          onLoadExample={() => store.loadExample()}
          onBuildFromScratch={() => store.updateHeader('name', 'New Resume')}
          onUpload={handleUploadClick}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-bg overflow-hidden">
      {/* Hidden file input for in-editor import */}
      <input
        ref={importFileRef}
        type="file"
        accept=".pdf,.doc,.docx"
        className="hidden"
        onChange={handleImportFile}
      />

      {/* Top Bar */}
      <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 shrink-0 bg-bg/50 backdrop-blur-md z-10">
        <div className="flex items-center gap-3 min-w-0">
          <input
            value={store.name}
            onChange={(e) => store.updateName(e.target.value)}
            aria-label="Resume name"
            className="bg-transparent text-base font-bold text-white border-none focus:ring-0 focus:outline-none w-56 min-w-0 truncate px-0 placeholder:text-text-muted"
            placeholder="Untitled Resume"
          />
          <span
            className={`px-2 py-0.5 rounded bg-white/5 text-[10px] font-mono uppercase tracking-wider border transition-colors shrink-0 ${
              saveStatus === 'saving'
                ? 'text-amber-400 border-amber-500/20 bg-amber-500/5'
                : 'text-text-muted border-white/5'
            }`}
          >
            {saveStatus === 'saving' ? 'Saving...' : 'Auto-saved'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Import button */}
          <button
            onClick={() => importFileRef.current?.click()}
            disabled={isImporting}
            className="min-h-[44px] flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/5 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Import resume from PDF or DOCX"
          >
            {isImporting ? (
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
            ) : (
              <Upload className="w-4 h-4 text-cyan-400" />
            )}
            <span className="hidden sm:inline">{isImporting ? 'Importing...' : 'Import'}</span>
          </button>
          {/* Template Picker toggle */}
          <div className="relative">
            <button
              onClick={() => setShowTemplatePicker((v) => !v)}
              className="min-h-[44px] flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/5 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-500/50"
              aria-label="Template picker"
            >
              <Layers className="w-4 h-4 text-purple-400" />
              <span className="hidden sm:inline">Templates</span>
            </button>
            {showTemplatePicker && (
              <div className="absolute right-0 top-full mt-2 z-50">
                <TemplatePicker
                  currentTemplate={store.template}
                  onSelect={(t) => {
                    store.updateTemplate(t)
                    setShowTemplatePicker(false)
                  }}
                />
              </div>
            )}
          </div>

          {/* PDF Download */}
          <PDFDownloadButton
            data={{
              id: store.id,
              name: store.name,
              template: store.template,
              header: store.header,
              summary: store.summary,
              skills: store.skills,
              experience: store.experience,
              education: store.education,
              projects: store.projects,
              competencies: store.competencies,
              referenceText: store.referenceText,
              isRefPanelCollapsed: store.isRefPanelCollapsed,
              importReview: store.importReview,
              resumeOrigin: store.resumeOrigin,
            }}
            className="min-h-[44px] flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/5 transition-colors focus-visible:ring-2 focus-visible:ring-cyan-500/50"
          />

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="min-h-[44px] flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-xs font-bold shadow-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-cyan-500/50"
          >
            {isSaving ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent animate-spin rounded-full" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            Save
          </button>
        </div>
      </div>

      {/* 3-Panel Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Form Panel (40%) */}
        <div className="w-[40%] min-w-0 border-r border-white/5 overflow-hidden flex flex-col">
          <FormPanel />
        </div>

        {/* Center: Preview Panel (35%) */}
        <div className="w-[35%] min-w-0 border-r border-white/5 overflow-hidden flex flex-col">
          <PreviewPanel />
        </div>

        {/* Right: AI Panel (25%) */}
        <div className="w-[25%] min-w-0 overflow-y-auto flex flex-col bg-white/[0.01]">
          {/* JD Match banner if jd_id param present */}
          {jdId && (
            <div className="m-4 p-3 rounded-[14px] bg-cyan-500/10 border border-cyan-500/20 flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-0.5">JD Match Active</p>
                <p className="text-xs text-text-2">
                  Showing resume suggestions for job <span className="font-mono text-cyan-300">{jdId}</span>
                </p>
              </div>
            </div>
          )}

          {/* AI Panel — wrapped in Suspense because AIPanel also calls useSearchParams */}
          <Suspense>
            <AIPanel />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export default function ResumePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen bg-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-cyan-500/20 border-t-cyan-500 animate-spin" />
          <span className="text-xs text-text-muted font-mono tracking-widest uppercase">Loading...</span>
        </div>
      </div>
    }>
      <ResumePageContent />
    </Suspense>
  )
}
