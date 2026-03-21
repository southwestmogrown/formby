import Link from 'next/link'
import type { Form } from '@/lib/types'
import DeleteFormButton from './DeleteFormButton'

interface FormCardProps {
  form: Form & { submissions: [{ count: number }] }
}

export default function FormCard({ form }: FormCardProps) {
  const n = form.submissions[0]?.count ?? 0

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <Link href={`/forms/${form.id}`} className="font-bold text-zinc-900 hover:underline">
          {form.name}
        </Link>
        {form.published ? (
          <span className="shrink-0 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
            Published
          </span>
        ) : (
          <span className="shrink-0 rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-600">
            Draft
          </span>
        )}
      </div>

      <div className="text-sm text-zinc-500">
        {n} submission{n !== 1 ? 's' : ''}
      </div>

      <div className="text-xs text-zinc-400">
        Created {new Date(form.created_at).toLocaleDateString()}
      </div>

      <div className="flex gap-3 mt-1 text-sm">
        <Link href={`/forms/${form.id}`} className="text-zinc-700 hover:underline font-medium">
          Edit
        </Link>
        <Link href={`/forms/${form.id}/embed`} className="text-zinc-700 hover:underline font-medium">
          Embed
        </Link>
        <Link href={`/forms/${form.id}/submissions`} className="text-zinc-700 hover:underline font-medium">
          Submissions
        </Link>
        <DeleteFormButton formId={form.id} formName={form.name} />
      </div>
    </div>
  )
}
