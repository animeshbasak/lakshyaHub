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
      if (payload.importReview.unclassified.length > 0) {
        toast(`${payload.importReview.unclassified.length} lines couldn't be classified — review the resume carefully.`, { icon: '⚠️' })
      }
      if (payload.importReview.confidence === 'low') {
        toast('Low parse confidence. Check all sections for accuracy.', { icon: '⚠️' })
      }
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
      <div
        className="flex items-center justify-center h-screen"
        style={{ background: 'var(--bg)' }}
      >
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--cyan)' }} />
          <span className="eyebrow">Loading resume...</span>
        </div>
      </div>
    )
  }

  if (isBlank) {
    return (
      <div className="flex-1 overflow-y-auto" style={{ background: 'var(--bg)' }}>
        <StarterExperience
          onLoadExample={() => store.loadExample()}
          onBuildFromScratch={() => store.updateHeader('name', 'New Resume')}
          onUpload={handleUploadClick}
        />
      </div>
    )
  }

  const isSaved = saveStatus !== 'saving'

  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={{ background: 'var(--bg)' }}
    >
      {/* Hidden file input for in-editor import */}
      <input
        ref={importFileRef}
        type="file"
        accept=".pdf,.doc,.docx"
        className="hidden"
        onChange={handleImportFile}
      />

      {/* Top Bar */}
      <div
        className="flex items-center justify-between px-5 shrink-0"
        style={{
          height: 56,
          borderBottom: '1px solid var(--hair)',
          background: 'var(--bg-1)',
        }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <input
            value={store.name}
            onChange={(e) => store.updateName(e.target.value)}
            aria-label="Resume name"
            className="bg-transparent border-none focus:ring-0 focus:outline-none w-64 min-w-0 truncate px-0"
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--fg)',
            }}
            placeholder="Untitled Resume"
          />
          <span
            className={`badge ${isSaved ? 'emerald' : 'amber'}`}
            style={{ fontSize: 9 }}
          >
            <span className="dot" />
            {isSaved ? 'Auto-saved' : 'Saving...'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Import button */}
          <button
            onClick={() => importFileRef.current?.click()}
            disabled={isImporting}
            className="btn sm"
            aria-label="Import resume from PDF or DOCX"
          >
            {isImporting ? (
              <Loader2 size={12} className="animate-spin" style={{ color: 'var(--cyan)' }} />
            ) : (
              <Upload size={12} style={{ color: 'var(--cyan)' }} />
            )}
            <span className="hidden sm:inline">{isImporting ? 'Importing...' : 'Import'}</span>
          </button>

          {/* Template Picker toggle */}
          <div className="relative">
            <button
              onClick={() => setShowTemplatePicker((v) => !v)}
              className={`btn sm ${showTemplatePicker ? 'primary' : ''}`}
              aria-label="Template picker"
            >
              <Layers size={12} style={{ color: showTemplatePicker ? undefined : 'var(--purple)' }} />
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
            className="btn sm"
          />

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn primary sm"
          >
            {isSaving ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Save size={12} />
            )}
            Save
          </button>
        </div>
      </div>

      {/* 3-Panel Layout — matches reference design: 320px | 1fr | 340px */}
      <div
        className="flex-1 overflow-hidden"
        style={{
          display: 'grid',
          gridTemplateColumns: '40% 1fr 360px',
          minHeight: 0,
        }}
      >
        {/* Left: Form Panel */}
        <div
          className="overflow-hidden flex flex-col min-w-0"
          style={{
            borderRight: '1px solid var(--hair)',
            background: 'var(--bg-1)',
          }}
        >
          <FormPanel />
        </div>

        {/* Center: Preview Panel */}
        <div
          className="overflow-hidden flex flex-col min-w-0"
          style={{
            borderRight: '1px solid var(--hair)',
            background: 'var(--bg)',
          }}
        >
          <PreviewPanel />
        </div>

        {/* Right: AI Panel */}
        <div
          className="overflow-y-auto flex flex-col min-w-0"
          style={{ background: 'var(--bg-1)' }}
        >
          {/* JD Match banner if jd_id param present */}
          {jdId && (
            <div
              className="card flex items-start gap-3"
              style={{
                margin: 12,
                padding: 12,
                background: 'var(--cyan-dim)',
                borderColor: 'var(--cyan-border)',
              }}
            >
              <Sparkles size={14} style={{ color: 'var(--cyan)', flexShrink: 0, marginTop: 2 }} />
              <div style={{ minWidth: 0 }}>
                <p className="eyebrow" style={{ color: 'var(--cyan)', marginBottom: 2 }}>
                  JD Match Active
                </p>
                <p className="text-2" style={{ fontSize: 11.5, margin: 0, lineHeight: 1.45 }}>
                  Showing resume suggestions for job{' '}
                  <span className="mono" style={{ color: 'var(--cyan)' }}>{jdId}</span>
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
      <div
        className="flex items-center justify-center h-screen"
        style={{ background: 'var(--bg)' }}
      >
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-5 h-5 animate-spin" style={{ color: 'var(--cyan)' }} />
          <span className="eyebrow">Loading...</span>
        </div>
      </div>
    }>
      <ResumePageContent />
    </Suspense>
  )
}
