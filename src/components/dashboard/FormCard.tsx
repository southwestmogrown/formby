import Link from 'next/link'
import type { Form } from '@/lib/types'
import DeleteFormButton from './DeleteFormButton'

interface FormCardProps {
  form: Form & { submissions: [{ count: number }] }
}

export default function FormCard({ form }: FormCardProps) {
  const n = form.submissions[0]?.count ?? 0

  return (
    <div className="rounded-xl border border-border bg-white p-5 flex flex-col gap-3 hover:border-brand transition-colors shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <Link href={`/forms/${form.id}`} className="font-semibold text-ink hover:text-brand transition-colors">
          {form.name}
        </Link>
        {form.published ? (
          <span className="shrink-0 rounded-full bg-bill-light px-2.5 py-0.5 text-xs font-medium text-bill">
            Published
          </span>
        ) : (
          <span className="shrink-0 rounded-full bg-brand-light px-2.5 py-0.5 text-xs font-medium text-brand">
            Draft
          </span>
        )}
      </div>

      <div className="text-sm text-ink-2">
        {n} submission{n !== 1 ? 's' : ''}
      </div>

      <div className="text-xs text-ink-muted">
        Created {new Date(form.created_at).toLocaleDateString()}
      </div>

      <div className="flex gap-3 mt-1 text-sm">
        <Link href={`/forms/${form.id}`} className="text-brand font-medium hover:text-brand-dark hover:underline transition-colors">Edit</Link>
        <Link href={`/forms/${form.id}/embed`} className="text-ink-2 font-medium hover:text-ink hover:underline transition-colors">Embed</Link>
        <Link href={`/forms/${form.id}/submissions`} className="text-ink-2 font-medium hover:text-ink hover:underline transition-colors">Submissions</Link>
        <DeleteFormButton formId={form.id} formName={form.name} />
      </div>
    </div>
  )
}
