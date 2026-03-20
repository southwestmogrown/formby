'use client'

import SubmissionTable from '@/components/dashboard/SubmissionTable'
import type { Form, Submission } from '@/lib/types'

interface SubmissionsPageContentProps {
  form: Form
  submissions: Submission[]
}

export default function SubmissionsPageContent({ form, submissions }: SubmissionsPageContentProps) {
  function handleExportCSV() {
    function escapeCSVValue(value: unknown): string {
      const str = value === undefined || value === null ? '' : String(value)
      if (str.includes(',') || str.includes('\n') || str.includes('"')) {
        return '"' + str.replace(/"/g, '""') + '"'
      }
      return str
    }

    const headers = [...form.fields.map((f) => f.label), 'Submitted']
    const rows = submissions.map((submission) => {
      const values = form.fields.map((f) => {
        const val = submission.data[f.id]
        if (Array.isArray(val)) return escapeCSVValue(val.join(', '))
        return escapeCSVValue(val)
      })
      values.push(escapeCSVValue(submission.created_at))
      return values.join(',')
    })

    const csv = [headers.map(escapeCSVValue).join(','), ...rows].join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'submissions.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="mb-4">
        <button onClick={handleExportCSV}>Export CSV</button>
      </div>
      <SubmissionTable fields={form.fields} submissions={submissions} />
    </div>
  )
}
