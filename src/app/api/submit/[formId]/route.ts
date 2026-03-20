import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { FormField } from '@/lib/types'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders })
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ formId: string }> }
) {
  const { formId } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('forms')
    .select('*')
    .eq('id', formId)
    .eq('published', true)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Form not found' }, { status: 404, headers: corsHeaders })
  }

  const form = data as { id: string; fields: FormField[]; webhook_url: string | null }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400, headers: corsHeaders })
  }

  const missingLabels: string[] = []
  for (const field of form.fields) {
    if (field.required) {
      const val = body[field.id]
      if (val === undefined || val === null || val === '' || (Array.isArray(val) && val.length === 0)) {
        missingLabels.push(field.label)
      }
    }
  }
  if (missingLabels.length > 0) {
    return NextResponse.json(
      { error: 'Missing required fields', fields: missingLabels },
      { status: 400, headers: corsHeaders }
    )
  }

  const { error: insertError } = await supabase
    .from('submissions')
    .insert({ form_id: formId, data: body })

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500, headers: corsHeaders })
  }

  if (form.webhook_url) {
    fetch(form.webhook_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ form_id: formId, data: body, submitted_at: new Date().toISOString() }),
    }).catch(() => {})
  }

  return NextResponse.json({ success: true }, { status: 201, headers: corsHeaders })
}
