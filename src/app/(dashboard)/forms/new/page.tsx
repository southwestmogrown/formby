'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { FormField } from '@/lib/types'
import PromptInput from '@/components/builder/PromptInput'
import FieldList from '@/components/builder/FieldList'
import FormPreview from '@/components/builder/FormPreview'

type Phase = 'empty' | 'generated'

export default function NewFormPage() {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>('empty')
  const [formName, setFormName] = useState('')
  const [description, setDescription] = useState('')
  const [fields, setFields] = useState<FormField[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  function handleGenerate(newFields: FormField[], name: string, desc: string) {
    setFields(newFields)
    setFormName(name)
    setDescription(desc)
    setPhase('generated')
  }

  async function handleSave(published: boolean) {
    if (isSaving) return
    setIsSaving(true)
    setSaveError(null)

    try {
      const res = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formName,
          description,
          fields,
          published,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setSaveError(data.error ?? 'Failed to save form. Please try again.')
        return
      }

      if (published) {
        router.push(`/forms/${data.id}/embed`)
      } else {
        router.push(`/forms/${data.id}`)
      }
    } catch {
      setSaveError('Network error. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  function handleRegenerate() {
    setPhase('empty')
  }

  if (phase === 'empty') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
        <div className="w-full max-w-xl">
          <h1 className="text-2xl font-semibold text-zinc-900 mb-2">Create a new form</h1>
          <p className="text-sm text-zinc-500 mb-8">
            Describe what your form should collect and we&apos;ll generate it instantly.
          </p>
          <PromptInput onGenerate={handleGenerate} initialDescription={description} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-3 bg-white">
        <div className="flex items-center gap-3">
          <button
            onClick={handleRegenerate}
            className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
          >
            ← Regenerate
          </button>
          <input
            type="text"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="Form name"
            aria-label="Form name"
            className="text-base font-semibold text-zinc-900 border-b border-transparent focus:border-zinc-300 focus:outline-none bg-transparent px-1"
          />
        </div>

        <div className="flex items-center gap-2">
          {saveError && (
            <p role="alert" className="text-sm text-red-600 mr-2">
              {saveError}
            </p>
          )}
          <button
            onClick={() => handleSave(false)}
            disabled={isSaving}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 transition-colors"
          >
            {isSaving ? 'Saving…' : 'Save Draft'}
          </button>
          <button
            onClick={() => handleSave(true)}
            disabled={isSaving}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 transition-colors"
          >
            {isSaving ? 'Publishing…' : 'Publish'}
          </button>
        </div>
      </div>

      {/* Split layout: FieldList left, FormPreview right */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div className="w-1/2 overflow-y-auto border-r border-zinc-200 p-6">
          <h2 className="text-sm font-medium text-zinc-500 mb-4 uppercase tracking-wide">Fields</h2>
          <FieldList fields={fields} onChange={setFields} />
        </div>
        <div className="w-1/2 overflow-y-auto p-6 bg-zinc-50">
          <h2 className="text-sm font-medium text-zinc-500 mb-4 uppercase tracking-wide">Preview</h2>
          <FormPreview fields={fields} name={formName} />
        </div>
      </div>
    </div>
  )
}
