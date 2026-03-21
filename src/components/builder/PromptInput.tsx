'use client'

import { useState } from 'react'
import type { FormField } from '@/lib/types'

const EXAMPLE_PROMPTS = [
  'Contact form with name, email, and message',
  'Job application with resume upload and experience fields',
  'Event registration with dietary restrictions and t-shirt size',
  'Customer feedback survey with star ratings',
]

interface PromptInputProps {
  onGenerate: (fields: FormField[], name: string, description: string) => void
  initialDescription?: string
  isDemo?: boolean
  demoGenerationsRemaining?: number
  disabled?: boolean
}

export default function PromptInput({
  onGenerate,
  initialDescription = '',
  isDemo,
  demoGenerationsRemaining,
  disabled,
}: PromptInputProps) {
  const [description, setDescription] = useState(initialDescription)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canGenerate = description.trim().length >= 10 && !isLoading && !disabled

  async function handleGenerate() {
    if (!canGenerate) return
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: description.trim(), isDemo }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.')
        return
      }

      onGenerate(data.fields, data.name, description.trim())
    } catch {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {isDemo && demoGenerationsRemaining !== undefined && (
        <p className="text-sm text-ink-muted">
          {demoGenerationsRemaining} generation{demoGenerationsRemaining !== 1 ? 's' : ''} remaining in demo
        </p>
      )}

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe your form in plain English… e.g. 'A contact form with name, email, phone, and a message field'"
        rows={4}
        disabled={disabled || isLoading}
        className="w-full rounded-lg border border-border px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand disabled:opacity-50"
      />

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        onClick={handleGenerate}
        disabled={!canGenerate}
        aria-busy={isLoading}
        className="self-end flex items-center justify-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-medium text-white disabled:opacity-40 hover:bg-brand-dark transition-colors min-w-[150px]"
      >
        {isLoading ? (
          <>
            <svg
              aria-hidden="true"
              className="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            Generating…
          </>
        ) : (
          'Generate Form'
        )}
      </button>

      <div className="flex flex-wrap gap-2">
        {EXAMPLE_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => setDescription(prompt)}
            disabled={disabled || isLoading}
            className="rounded-full border border-border px-3 py-1 text-xs text-ink-2 hover:border-brand hover:text-brand transition-colors disabled:opacity-40"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  )
}
