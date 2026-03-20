import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import EmbedPageContent from './EmbedPageContent'

export default async function EmbedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: form, error } = await supabase.from('forms').select('*').eq('id', id).single()
  if (error || !form) notFound()

  return <EmbedPageContent form={form} />
}
