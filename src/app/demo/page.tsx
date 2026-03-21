'use client'

import { useState, useEffect } from 'react'
import type { FormField } from '@/lib/types'
import PromptInput from '@/components/builder/PromptInput'
import FieldList from '@/components/builder/FieldList'
import FormPreview from '@/components/builder/FormPreview'
import DemoBanner from '@/components/shared/DemoBanner'
import Link from 'next/link'
import {
  getDemoGenerationsUsed,
  getDemoApiKey,
  incrementDemoUsage,
  setDemoApiKey,
  canGenerate,
} from '@/lib/demo'

type Phase = 'empty' | 'generated'

export default function DemoPage() {
  const [phase, setPhase] = useState<Phase>('empty')
  const [formName, setFormName] = useState('')
  const [fields, setFields] = useState<FormField[]>([])
  const [description, setDescription] = useState('')
  const [generationsUsed, setGenerationsUsed] = useState(0)
  const [apiKey, setApiKey] = useState<string | null>(null)
  // mounted tracks whether client localStorage has been read
  const [mounted, setMounted] = useState(false)

  // Load demo state after mount (localStorage not available on server).
  // This effect intentionally calls setState to hydrate from localStorage;
  // the pattern is correct for client-only state initialization.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setGenerationsUsed(getDemoGenerationsUsed())
    setApiKey(getDemoApiKey())
    setMounted(true)
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

  function handleApiKeyChange(key: string | null) {
    setDemoApiKey(key)
    setApiKey(key)
  }

  function handleGenerate(newFields: FormField[], name: string, desc: string) {
    if (!apiKey) {
      incrementDemoUsage()
      setGenerationsUsed(prev => prev + 1)
    }
    setFields(newFields)
    setFormName(name)
    setDescription(desc)
    setPhase('generated')
  }

  const disabled = mounted && !canGenerate()

  if (phase === 'empty') {
    return (
      <div className="min-h-screen flex flex-col bg-surface">
        {mounted && (
          <DemoBanner
            generationsUsed={generationsUsed}
            apiKey={apiKey}
            onApiKeyChange={handleApiKeyChange}
          />
        )}
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
          <div className="w-full max-w-xl">
            <h1 className="text-2xl font-semibold text-ink mb-2">Try Formby</h1>
            <p className="text-sm text-ink-2 mb-8">
              Describe your form below and watch it build itself. No account needed.
            </p>
            <PromptInput
              onGenerate={handleGenerate}
              initialDescription={description}
              isDemo={!apiKey}
              apiKey={apiKey ?? undefined}
              demoGenerationsRemaining={mounted ? Math.max(0, 3 - generationsUsed) : 3}
              disabled={disabled}
            />
            {disabled && (
              <div className="mt-6 rounded-xl border border-border bg-white p-5 text-center">
                <p className="text-ink font-medium mb-1">You&apos;ve used all 3 free generations</p>
                <p className="text-sm text-ink-2 mb-4">Sign up free to keep building, or add your own Anthropic API key above.</p>
                <Link href="/signup" className="inline-block rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand-dark transition-colors">
                  Create free account →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {mounted && (
        <DemoBanner
          generationsUsed={generationsUsed}
          apiKey={apiKey}
          onApiKeyChange={handleApiKeyChange}
        />
      )}

      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-border px-6 py-3 bg-white min-h-[56px]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPhase('empty')}
            className="text-sm text-ink-muted hover:text-brand transition-colors"
          >
            ← Regenerate
          </button>
          <span className="text-base font-semibold text-ink">{formName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/signup"
            className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark transition-colors"
          >
            Sign up to save &amp; publish →
          </Link>
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
