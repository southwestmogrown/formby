'use client'

import { useState } from 'react'

interface EmbedCodeBlockProps {
  formId: string
}

export default function EmbedCodeBlock({ formId }: EmbedCodeBlockProps) {
  const [iframeCopied, setIframeCopied] = useState(false)
  const [scriptCopied, setScriptCopied] = useState(false)

  const origin = typeof window !== 'undefined' ? window.location.origin : ''

  const iframeCode = `<iframe src="${origin}/embed/${formId}" width="100%" height="600" frameborder="0"></iframe>`
  const scriptCode = `<script src="${origin}/embed/${formId}.js" async></script>\n<div id="ai-form-${formId}"></div>`

  async function handleCopyIframe() {
    await navigator.clipboard.writeText(iframeCode)
    setIframeCopied(true)
    setTimeout(() => setIframeCopied(false), 2000)
  }

  async function handleCopyScript() {
    await navigator.clipboard.writeText(scriptCode)
    setScriptCopied(true)
    setTimeout(() => setScriptCopied(false), 2000)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-zinc-700">iframe embed</h3>
        <pre
          style={{
            backgroundColor: '#1e1e1e',
            color: '#ffffff',
            fontFamily: 'monospace',
            padding: '1rem',
            borderRadius: '0.5rem',
            overflowX: 'scroll',
          }}
        >
          {iframeCode}
        </pre>
        <button
          onClick={handleCopyIframe}
          className="self-start rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
        >
          {iframeCopied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-zinc-700">Script tag</h3>
        <pre
          style={{
            backgroundColor: '#1e1e1e',
            color: '#ffffff',
            fontFamily: 'monospace',
            padding: '1rem',
            borderRadius: '0.5rem',
            overflowX: 'scroll',
          }}
        >
          {scriptCode}
        </pre>
        <button
          onClick={handleCopyScript}
          className="self-start rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
        >
          {scriptCopied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  )
}
