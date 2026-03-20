import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import type { GenerateRequest, GenerateResponse } from '@/lib/types'

const SYSTEM_PROMPT = `You are a form builder assistant. When given a description of a form, return ONLY a valid JSON object with this exact shape:
{
  "name": "string — a short descriptive form name",
  "fields": [
    {
      "id": "unique_snake_case_id",
      "type": "text|email|phone|textarea|select|checkbox|radio|number|date",
      "label": "string",
      "placeholder": "string or omit",
      "required": true|false,
      "options": ["array", "of", "strings"] or omit,
      "helpText": "string or omit"
    }
  ]
}
Return nothing else. No explanation, no markdown, no code fences.`

// In-memory rate limit store: IP → count. Lives for the process lifetime.
const demoUsage = new Map<string, number>()

function getClientIp(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
}

export async function POST(request: NextRequest) {
  let body: GenerateRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { description, isDemo } = body

  if (!description || description.trim().length < 10) {
    return NextResponse.json(
      { error: 'Description must be at least 10 characters' },
      { status: 400 }
    )
  }

  let demoIp: string | null = null
  if (isDemo) {
    const ip = getClientIp(request)
    const limit = parseInt(process.env.DEMO_GENERATION_LIMIT ?? '3', 10)
    const used = demoUsage.get(ip) ?? 0
    if (used >= limit) {
      return NextResponse.json(
        { error: 'Demo generation limit reached. Sign up to continue.' },
        { status: 429 }
      )
    }
    // Store IP to increment after a successful generation (not before)
    demoIp = ip
  }

  const client = new Anthropic()

  let text: string
  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: description.trim() }],
    })
    const block = message.content[0]
    text = block.type === 'text' ? block.text : ''
  } catch (err) {
    console.error('Anthropic API error:', err)
    return NextResponse.json({ error: 'AI service error' }, { status: 502 })
  }

  let parsed: GenerateResponse
  try {
    parsed = JSON.parse(text)
  } catch {
    console.error('Failed to parse Claude output:', text)
    return NextResponse.json(
      { error: 'Failed to parse AI response as JSON' },
      { status: 500 }
    )
  }

  if (
    typeof parsed.name !== 'string' ||
    !Array.isArray(parsed.fields)
  ) {
    return NextResponse.json(
      { error: 'AI response does not match expected shape' },
      { status: 500 }
    )
  }

  // Only count a demo generation after we have a valid successful response
  if (demoIp !== null) {
    demoUsage.set(demoIp, (demoUsage.get(demoIp) ?? 0) + 1)
  }

  return NextResponse.json(parsed)
}
