'use client'

import { useState } from 'react'
import type { FormField, Submission } from '@/lib/types'

interface SubmissionTableProps {
  fields: FormField[]
  submissions: Submission[]
}

export default function SubmissionTable({ fields, submissions }: SubmissionTableProps) {
  const [sort, setSort] = useState<'asc' | 'desc'>('desc')

  if (submissions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-12 text-center">
        <p className="text-ink-muted text-sm">No submissions yet.</p>
        <p className="text-ink-muted text-xs mt-1">Share your embedded form to start collecting responses.</p>
      </div>
    )
  }

  const sorted = [...submissions].sort((a, b) => {
    const aTime = new Date(a.created_at).getTime()
    const bTime = new Date(b.created_at).getTime()
    return sort === 'desc' ? bTime - aTime : aTime - bTime
  })

  function formatValue(value: string | string[] | boolean | undefined | null): string {
    if (value === undefined || value === null) return ''
    if (Array.isArray(value)) return value.join(', ')
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    return String(value)
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full border-collapse text-sm min-w-max">
        <thead>
          <tr className="bg-brand-light border-b border-border">
            {fields.map((field) => (
              <th key={field.id} className="px-4 py-3 text-left text-xs font-semibold text-ink-2 uppercase tracking-wide whitespace-nowrap">
                {field.label}
              </th>
            ))}
            <th
              className="px-4 py-3 text-left text-xs font-semibold text-ink-2 uppercase tracking-wide whitespace-nowrap cursor-pointer select-none hover:text-brand transition-colors"
              onClick={() => setSort(sort === 'desc' ? 'asc' : 'desc')}
            >
              Submitted {sort === 'desc' ? '↓' : '↑'}
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((submission, i) => (
            <tr
              key={submission.id}
              className={`border-b border-border last:border-b-0 hover:bg-brand-light/40 transition-colors ${i % 2 === 1 ? 'bg-surface' : 'bg-white'}`}
            >
              {fields.map((field) => (
                <td key={field.id} className="px-4 py-3 text-ink">
                  {formatValue(submission.data[field.id])}
                </td>
              ))}
              <td className="px-4 py-3 font-mono text-xs text-ink-muted whitespace-nowrap">
                {new Date(submission.created_at).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
