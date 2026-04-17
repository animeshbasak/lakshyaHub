// src/features/resume-builder/components/PDFDownloadButton.tsx
'use client'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { TEMPLATE_COMPONENTS } from '../templates'
import { HarvardTemplate } from '../templates/HarvardTemplate'
import { ResumeData } from '@/types'
import { Download, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'

export function PDFDownloadButton({ data, className }: { data: ResumeData, className?: string }) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  const TemplateComponent = TEMPLATE_COMPONENTS[data.template] ?? HarvardTemplate

  return (
    <PDFDownloadLink
      document={<TemplateComponent data={data} />}
      fileName={`${(data.header.name || 'Resume').replace(/\s+/g, '_').toLowerCase()}.pdf`}
      className={className}
    >
      {({ loading }) => (
        <span className="flex items-center gap-2">
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Download PDF
            </>
          )}
        </span>
      )}
    </PDFDownloadLink>
  )
}
