import { cache } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import type { Form } from '@/lib/types'
import EditFormPage from './EditFormPage'

interface Props {
  params: Promise<{ id: string }>
}

const getForm = cache(async (id: string) => {
  const supabase = await createClient()
  const { data: form } = await supabase.from('forms').select('*').eq('id', id).single()
  return form ?? null
})

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const form = await getForm(id)

  if (!form) {
    return { title: 'Form not found — Formby' }
  }

  return { title: { absolute: `${form.name} — Formby` } }
}

export default async function Page({ params }: Props) {
  const { id } = await params
  const form = await getForm(id)

  if (!form) {
    notFound()
  }

  return <EditFormPage form={form as Form} />
}
