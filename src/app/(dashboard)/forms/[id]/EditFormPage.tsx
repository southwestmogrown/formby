'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Form, FormField } from '@/lib/types'
import FieldList from '@/components/builder/FieldList'
import FormPreview from '@/components/builder/FormPreview'

interface Props {
  form: Form
}

export default function EditFormPage({ form }: Props) {
  const router = useRouter()
  const [formName, setFormName] = useState(form.name)
  const [fields, setFields] = useState<FormField[]>(form.fields)
  const [isPublished, setIsPublished] = useState(form.published)
  const [savingAs, setSavingAs] = useState<'draft' | 'publish' | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const savedAtTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (savedAtTimerRef.current) clearTimeout(savedAtTimerRef.current)
    }
  }, [])

  async function handleSave(publish: boolean) {
    if (savingAs !== null) return
    if (!formName.trim()) {
      setSaveError('Form name cannot be empty.')
      return
    }
    setSavingAs(publish ? 'publish' : 'draft')
    setSaveError(null)

    try {
      const res = await fetch(`/api/forms/${form.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formName, fields, published: publish }),
      })

      const data = await res.json()

      if (!res.ok) {
        setSaveError(data.error ?? 'Failed to save form. Please try again.')
        return
      }

      if (publish) {
        router.refresh()
        router.push(`/forms/${form.id}/embed`)
      } else {
        setSavedAt('Saved')
        setIsPublished(publish)
        if (savedAtTimerRef.current) clearTimeout(savedAtTimerRef.current)
        savedAtTimerRef.current = setTimeout(() => setSavedAt(null), 2000)
      }
    } catch {
      setSaveError('Network error. Please try again.')
    } finally {
      setSavingAs(null)
    }
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-3 bg-white min-h-[56px]">
        <div className="flex items-center gap-3">
          <Link href="/forms" className="text-sm text-ink-muted hover:text-brand transition-colors">
            ← My Forms
          </Link>
          <input
            type="text"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            aria-label="Form name"
            className="text-base font-semibold text-ink border-b border-transparent focus:border-brand focus:outline-none bg-transparent px-1"
          />
        </div>
        <div className="flex items-center gap-2">
          {saveError && (
            <p role="alert" className="text-sm text-red-600 mr-2">
              {saveError}
            </p>
          )}
          {savedAt && (
            <p role="status" className="text-sm text-brand mr-2">{savedAt}</p>
          )}
          <button
            onClick={() => handleSave(false)}
            disabled={savingAs !== null}
            aria-busy={savingAs === 'draft'}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-ink-2 hover:bg-surface disabled:opacity-50 transition-colors"
          >
            {savingAs === 'draft' ? 'Saving…' : 'Save Draft'}
          </button>
          <button
            onClick={() => handleSave(!isPublished)}
            disabled={savingAs !== null}
            aria-busy={savingAs === 'publish'}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50 transition-colors"
          >
            {savingAs === 'publish'
              ? (isPublished ? 'Unpublishing…' : 'Publishing…')
              : (isPublished ? 'Unpublish' : 'Publish')}
          </button>
        </div>
      </div>

      {/* Split layout */}
      <div className="flex flex-col md:flex-row flex-1">
        <div className="w-full md:w-1/2 overflow-y-auto border-b md:border-b-0 md:border-r border-border p-4 md:p-6">
          <h2 className="text-sm font-medium text-ink-muted mb-4 uppercase tracking-wide">Fields</h2>
          <FieldList fields={fields} onChange={setFields} />
        </div>
        <div className="w-full md:w-1/2 overflow-y-auto p-4 md:p-6 bg-surface">
          <h2 className="text-sm font-medium text-ink-muted mb-4 uppercase tracking-wide">Preview</h2>
          <FormPreview fields={fields} name={formName} />
        </div>
      </div>
    </div>
  )
}
