'use client'

import { useState } from 'react'
import type { Form } from '@/lib/types'
import EmbedCodeBlock from '@/components/shared/EmbedCodeBlock'
import WebhookSettings from '@/components/dashboard/WebhookSettings'
import Link from 'next/link'

interface EmbedPageContentProps {
  form: Form
}

export default function EmbedPageContent({ form }: EmbedPageContentProps) {
  const [webhookUrl, setWebhookUrl] = useState(form.webhook_url ?? '')

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold text-zinc-900">{form.name} — Embed</h1>
        <Link href={`/forms/${form.id}`} className="text-sm text-zinc-500 hover:text-zinc-700">
          ← Back to editor
        </Link>
      </div>

      {!form.published && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          This form is not published yet. Publish it from the editor to make it publicly embeddable.
        </div>
      )}

      <section>
        <h2 className="text-base font-medium text-zinc-800 mb-3">Embed code</h2>
        <EmbedCodeBlock formId={form.id} />
      </section>

      <section>
        <h2 className="text-base font-medium text-zinc-800 mb-3">Webhook</h2>
        <WebhookSettings
          formId={form.id}
          initialWebhookUrl={webhookUrl}
          onSave={setWebhookUrl}
        />
      </section>

      <Link href={`/forms/${form.id}/submissions`} className="text-sm text-zinc-500 hover:text-zinc-700">
        View submissions →
      </Link>
    </div>
  )
}
