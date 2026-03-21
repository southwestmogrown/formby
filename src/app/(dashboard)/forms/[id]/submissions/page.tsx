import type { Metadata } from 'next'
import { cache } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import SubmissionsPageContent from './SubmissionsPageContent'
import type { Form, Submission } from '@/lib/types'

const getForm = cache(async (id: string) => {
  const supabase = await createClient()
  const { data: form } = await supabase.from('forms').select('*').eq('id', id).single()
  return form ?? null
})

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const form = await getForm(id)
  return { title: form ? { absolute: `${form.name} — Submissions — Formby` } : 'Submissions' }
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const form = await getForm(id)

  if (!form) notFound()

  const { data: submissions } = await supabase
    .from('submissions')
    .select('*')
    .eq('form_id', id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/" className="text-sm text-ink-muted hover:text-brand transition-colors">← My Forms</Link>
        <Link href={`/forms/${id}/embed`} className="text-sm text-ink-muted hover:text-brand transition-colors">Embed settings</Link>
      </div>
      <h1 className="text-2xl font-bold text-ink mb-6">{form.name} — Submissions</h1>
      <SubmissionsPageContent form={form as Form} submissions={(submissions ?? []) as Submission[]} />
    </div>
  )
}
