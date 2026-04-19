// src/features/resume-builder/components/ResumePDFView.tsx
'use client'
import { PDFViewer } from '@react-pdf/renderer'
import { TEMPLATE_COMPONENTS } from '../templates'
import { HarvardTemplate } from '../templates/HarvardTemplate'
import { ResumeData } from '@/types'
import { useEffect, useState } from 'react'

export function ResumePDFView({ data }: { data: ResumeData }) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-white/40 border-t-transparent animate-spin rounded-full mb-4" />
      <p className="text-slate-400 font-medium text-sm">Preparing PDF Preview...</p>
    </div>
  )

  const TemplateComponent = TEMPLATE_COMPONENTS[data.template] ?? HarvardTemplate

  return (
    <div className="w-full h-full">
      <PDFViewer className="w-full h-full border-none shadow-2xl" showToolbar={false}>
        <TemplateComponent data={data} />
      </PDFViewer>
    </div>
  )
}
