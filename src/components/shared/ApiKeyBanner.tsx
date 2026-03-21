'use client'

import { useState, useEffect } from 'react'
import { getApiKey, saveApiKey } from '@/lib/apiKey'

export default function ApiKeyBanner({ userId }: { userId: string }) {
  const [hasKey, setHasKey] = useState(true) // optimistic: assume key exists until mounted
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setHasKey(getApiKey(userId) !== null)
    setMounted(true)
  }, [userId])
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!mounted || hasKey) return null

  function handleSave() {
    const trimmed = draft.trim()
    if (!trimmed.startsWith('sk-ant-')) {
      setError('Key must start with sk-ant-')
      return
    }
    saveApiKey(userId, trimmed)
    setHasKey(true)
  }

  return (
    <div className="border-b border-bill-light bg-bill-light px-4 py-3">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <p className="text-sm text-bill font-medium shrink-0">
          Add your Anthropic API key to generate forms
        </p>
        <div className="flex flex-col gap-1 flex-1">
          <div className="flex gap-2">
            <input
              type="password"
              value={draft}
              onChange={e => { setDraft(e.target.value); setError(null) }}
              placeholder="sk-ant-api03-..."
              className="flex-1 rounded-lg border border-border bg-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand font-mono"
            />
            <button
              type="button"
              onClick={handleSave}
              className="rounded-lg bg-brand px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-dark transition-colors shrink-0"
            >
              Save key
            </button>
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <p className="text-xs text-ink-muted">
            Stored in your browser only · never sent to our servers except to make the Anthropic call on your behalf
          </p>
        </div>
      </div>
    </div>
  )
}
