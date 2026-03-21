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
        <h1 className="text-2xl font-bold text-zinc-900">My Forms</h1>
        <Link
          href="/forms/new"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
        >
          New Form
        </Link>
      </div>

      {formList.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-zinc-500 mb-4">No forms yet.</p>
          <Link href="/forms/new" className="text-zinc-900 font-medium underline">
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
