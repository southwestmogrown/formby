'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  formId: string
  formName: string
}

export default function DeleteFormButton({ formId, formName }: Props) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mountedRef = useRef(true)

  useEffect(() => {
    return () => { mountedRef.current = false }
  }, [])

  async function handleDelete() {
    setDeleting(true)
    setError(null)
    try {
      const res = await fetch(`/api/forms/${formId}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        if (mountedRef.current) {
          setError(data.error ?? 'Delete failed.')
        }
      } else {
        router.refresh()
        return
      }
    } catch {
      if (mountedRef.current) {
        setError('Network error.')
      }
    }
    if (mountedRef.current) setDeleting(false)
  }

  if (confirming) {
    return (
      <span className="flex items-center gap-2">
        {error && <span className="text-xs text-red-600">{error}</span>}
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          aria-busy={deleting}
          aria-label={`Confirm delete ${formName}`}
          className="text-red-600 hover:underline font-medium disabled:opacity-50"
        >
          {deleting ? 'Deleting…' : 'Confirm'}
        </button>
        <button
          type="button"
          onClick={() => { setConfirming(false); setError(null) }}
          disabled={deleting}
          aria-label={`Cancel delete ${formName}`}
          className="text-zinc-400 hover:underline"
        >
          Cancel
        </button>
      </span>
    )
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      aria-label={`Delete ${formName}`}
      className="text-zinc-400 hover:text-red-600 hover:underline font-medium transition-colors"
    >
      Delete
    </button>
  )
}
