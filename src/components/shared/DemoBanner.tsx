'use client'

import { useState } from 'react'
import Link from 'next/link'
import { DEMO_LIMIT } from '@/lib/demo'

interface DemoBannerProps {
  generationsUsed: number
  apiKey: string | null
  onApiKeyChange: (key: string | null) => void
}

export default function DemoBanner({ generationsUsed, apiKey, onApiKeyChange }: DemoBannerProps) {
  const [showKeyInput, setShowKeyInput] = useState(false)
  const [keyDraft, setKeyDraft] = useState('')
  const [keyError, setKeyError] = useState<string | null>(null)

  const remaining = apiKey !== null ? null : Math.max(0, DEMO_LIMIT - generationsUsed)

  function handleSaveKey() {
    const trimmed = keyDraft.trim()
    if (!trimmed.startsWith('sk-ant-')) {
      setKeyError('Key must start with sk-ant-')
      return
    }
    onApiKeyChange(trimmed)
    setShowKeyInput(false)
    setKeyDraft('')
    setKeyError(null)
  }

  function handleRemoveKey() {
    onApiKeyChange(null)
  }

  return (
    <div className="border-b border-border bg-brand-light px-4 py-3">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">

        {/* Status */}
        <div className="flex items-center gap-3 text-sm">
          {apiKey !== null ? (
            <span className="text-brand font-medium">✓ Using your API key · unlimited generations</span>
          ) : remaining === 0 ? (
            <span className="text-red-600 font-medium">No free generations left</span>
          ) : (
            <span className="text-ink-2">
              <span className="font-semibold text-brand">{remaining}</span> free {remaining === 1 ? 'generation' : 'generations'} remaining
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 text-sm flex-wrap">
          {apiKey !== null ? (
            <button
              type="button"
              onClick={handleRemoveKey}
              className="text-ink-muted hover:text-ink underline"
            >
              Remove key
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowKeyInput(v => !v)}
              className="text-ink-2 hover:text-ink underline"
            >
              {showKeyInput ? 'Cancel' : 'Use your own API key'}
            </button>
          )}
          <Link
            href="/signup"
            className="rounded-lg bg-brand px-3 py-1 text-xs font-semibold text-white hover:bg-brand-dark transition-colors"
          >
            Sign up free →
          </Link>
        </div>
      </div>

      {/* BYOK input */}
      {showKeyInput && (
        <div className="max-w-6xl mx-auto mt-3 flex flex-col sm:flex-row gap-2 items-start">
          <div className="flex flex-col gap-1 flex-1">
            <input
              type="password"
              value={keyDraft}
              onChange={e => { setKeyDraft(e.target.value); setKeyError(null) }}
              placeholder="sk-ant-api03-..."
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand font-mono"
            />
            {keyError && <p className="text-xs text-red-600">{keyError}</p>}
            <p className="text-xs text-ink-muted">
              Your key is stored in your browser only. It is sent to our API solely to make the Anthropic call on your behalf and is never stored on our servers.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSaveKey}
            className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark transition-colors shrink-0"
          >
            Save key
          </button>
        </div>
      )}
    </div>
  )
}
