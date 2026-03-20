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
    return <p>No submissions yet.</p>
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
    <table>
      <thead>
        <tr>
          {fields.map((field) => (
            <th key={field.id}>{field.label}</th>
          ))}
          <th
            style={{ cursor: 'pointer' }}
            onClick={() => setSort(sort === 'desc' ? 'asc' : 'desc')}
          >
            Submitted {sort === 'desc' ? '▼' : '▲'}
          </th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((submission) => (
          <tr key={submission.id}>
            {fields.map((field) => (
              <td key={field.id}>
                {formatValue(submission.data[field.id])}
              </td>
            ))}
            <td>{new Date(submission.created_at).toLocaleString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
