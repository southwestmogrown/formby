import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET /api/forms/[id] — get a single form by id
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('forms')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Form not found' }, { status: 404 })
  }

  return NextResponse.json(data)
}

// PUT /api/forms/[id] — update a form by id
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { name?: unknown; fields?: unknown; published?: unknown; webhook_url?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { name, fields, published, webhook_url } = body
  const { data, error } = await supabase
    .from('forms')
    .update({ name, fields, published, webhook_url, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: 'Form not found' }, { status: 404 })
  }

  return NextResponse.json(data)
}

// DELETE /api/forms/[id] — delete a form by id
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error, count } = await supabase
    .from('forms')
    .delete({ count: 'exact' })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error || !count) {
    return NextResponse.json({ error: 'Form not found' }, { status: 404 })
  }

  return new Response(null, { status: 204 })
}
