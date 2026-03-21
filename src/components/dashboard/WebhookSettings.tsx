'use client'

import { useState } from 'react'

interface WebhookSettingsProps {
  formId: string
  initialWebhookUrl?: string
  onSave: (url: string) => void
}

export default function WebhookSettings({ formId, initialWebhookUrl, onSave }: WebhookSettingsProps) {
  const [webhookUrl, setWebhookUrl] = useState(initialWebhookUrl ?? '')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'ok' | 'error'>('idle')

  async function handleSave() {
    setSaveStatus('saving')
    try {
      const res = await fetch(`/api/forms/${formId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webhook_url: webhookUrl }),
      })
      if (res.ok) {
        setSaveStatus('saved')
        onSave(webhookUrl)
        setTimeout(() => setSaveStatus('idle'), 2000)
      } else {
        setSaveStatus('error')
      }
    } catch {
      setSaveStatus('error')
    }
  }

  async function handleTest() {
    setTestStatus('testing')
    try {
      const res = await fetch('/api/webhook/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: webhookUrl }),
      })
      if (res.ok) {
        setTestStatus('ok')
        setTimeout(() => setTestStatus('idle'), 2000)
      } else {
        setTestStatus('error')
      }
    } catch {
      setTestStatus('error')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="webhook-url" className="text-sm font-medium text-ink-2">
          Webhook URL
        </label>
        <input
          id="webhook-url"
          type="url"
          value={webhookUrl}
          onChange={(e) => setWebhookUrl(e.target.value)}
          placeholder="https://..."
          className="rounded-lg border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleSave}
          disabled={saveStatus === 'saving'}
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:opacity-50 transition-colors"
        >
          {saveStatus === 'saving' ? 'Saving...' : 'Save'}
        </button>
        <button
          onClick={handleTest}
          disabled={testStatus === 'testing' || webhookUrl === ''}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-ink-2 hover:bg-surface disabled:opacity-50 transition-colors"
        >
          {testStatus === 'testing' ? 'Testing...' : 'Test'}
        </button>
      </div>

      <div className="flex flex-col gap-1">
        {saveStatus === 'saved' && (
          <p className="text-sm text-brand">Saved!</p>
        )}
        {saveStatus === 'error' && (
          <p className="text-sm text-red-600">Error saving</p>
        )}
        {testStatus === 'ok' && (
          <p className="text-sm text-green-600">Webhook responded successfully!</p>
        )}
        {testStatus === 'error' && (
          <p className="text-sm text-red-600">Webhook test failed</p>
        )}
      </div>
    </div>
  )
}
