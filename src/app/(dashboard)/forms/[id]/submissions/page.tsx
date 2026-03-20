import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SubmissionsPageContent from './SubmissionsPageContent'
import type { Form, Submission } from '@/lib/types'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: form, error: formError } = await supabase
    .from('forms')
    .select('*')
    .eq('id', id)
    .single()

  if (formError || !form) notFound()

  const { data: submissions } = await supabase
    .from('submissions')
    .select('*')
    .eq('form_id', id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6">
        <a href={`/forms/${id}/embed`} className="text-sm text-zinc-500 hover:text-zinc-700">← Back to embed</a>
      </div>
      <h1 className="text-2xl font-bold text-zinc-900 mb-6">{form.name} — Submissions</h1>
      <SubmissionsPageContent form={form as Form} submissions={(submissions ?? []) as Submission[]} />
    </div>
  )
}
