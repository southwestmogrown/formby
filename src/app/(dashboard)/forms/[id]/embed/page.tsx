import type { Metadata } from 'next'
import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import EmbedPageContent from './EmbedPageContent'

const getForm = cache(async (id: string) => {
  const supabase = await createClient()
  const { data: form } = await supabase.from('forms').select('*').eq('id', id).single()
  return form ?? null
})

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const form = await getForm(id)
  return { title: form ? { absolute: `${form.name} — Embed — Formby` } : 'Embed' }
}

export default async function EmbedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const form = await getForm(id)
  if (!form) notFound()

  return <EmbedPageContent form={form} />
}
