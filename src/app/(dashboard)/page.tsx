import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import FormCard from '@/components/dashboard/FormCard'
import type { Form } from '@/lib/types'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'My Forms' }

export default async function Page() {
  const supabase = await createClient()

  const { data: forms } = await supabase
    .from('forms')
    .select('*, submissions(count)')
    .order('created_at', { ascending: false })

  const formList = (forms ?? []) as (Form & { submissions: [{ count: number }] })[]

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-ink">My Forms</h1>
        <Link
          href="/forms/new"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark transition-colors"
        >
          New Form
        </Link>
      </div>

      {formList.length === 0 ? (
        <div className="text-center py-16 rounded-xl border border-dashed border-border">
          <p className="text-ink-2 mb-2 font-medium">No forms yet</p>
          <p className="text-ink-muted text-sm mb-4">Build your first form with AI in seconds.</p>
          <Link href="/forms/new" className="inline-block rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark transition-colors">
            Create your first form
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {formList.map((form) => (
            <FormCard key={form.id} form={form} />
          ))}
        </div>
      )}
    </div>
  )
}
