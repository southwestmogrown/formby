import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'
import type { GenerateRequest, GenerateResponse } from '@/lib/types'

const SYSTEM_PROMPT = `You are an expert form designer. Given a description of a form, return a single valid JSON object — nothing else. No explanation, no markdown, no code fences. The response must be parseable by JSON.parse() or the application breaks.

## JSON Shape

{
  "name": "string — short, descriptive form name in Title Case",
  "fields": [
    {
      "id": "unique_snake_case_id",
      "type": "text|email|phone|number|date|textarea|select|radio|checkbox",
      "label": "string",
      "placeholder": "string — omit for date, select, radio, checkbox",
      "required": true|false,
      "options": ["array", "of", "strings"] — include for select, radio, and multi-select checkbox; omit otherwise,
      "helpText": "string — omit unless it genuinely reduces confusion"
    }
  ]
}

## Field Ordering (strictly enforce this sequence)

1. Identity and contact fields first: name, email, phone
2. Core purpose fields next: the primary information the form collects
3. Supplementary or optional fields after
4. Availability, salary, or preference fields near the end
5. Legal, consent, and certification checkboxes ALWAYS last — never place them mid-form

## Type Selection Rules

- text — single-line free text: name, title, city, company, URL
- email — email addresses only
- phone — phone numbers only
- number — numeric quantities: years of experience, salary, age, quantity
- date — actual calendar dates: start date, date of birth, event date
- textarea — multi-line free text: cover letter, message, description, explanation
- select — single choice from 6 or more options, or when a dropdown is the most natural UI
- radio — mutually exclusive single choice from 2–5 options (e.g. Yes/No, employment type, gender)
- checkbox without options — single boolean toggle: consent, certification, or agreement (e.g. "I certify that all information provided is accurate and complete")
- checkbox with options — multi-select from a list: skills, dietary restrictions, days available

## Label Quality Rules

- Use natural Title Case: "First Name", "Date of Birth", "Years of Experience"
- Never use the raw field ID as the label ("first_name" is wrong; "First Name" is correct)
- Be specific and contextual: for a contact form, prefer "How Can We Help?" over "Message"
- Agreement and consent checkbox labels must be complete sentences starting with "I": "I agree to the terms and conditions"

## Placeholder Quality Rules

- Show a realistic example value — never repeat or paraphrase the label
- text: "e.g. Jane Smith", "e.g. Acme Corp", "e.g. San Francisco"
- email: "e.g. jane.smith@company.com"
- phone: "e.g. +1 (555) 123-4567"
- number: "e.g. 5", "e.g. 75000"
- textarea: a brief action prompt, e.g. "Describe your relevant experience and why you're a strong fit..."
- date: omit — the browser renders a native date picker
- select, radio, checkbox: omit

## Options Quality Rules

- Options must be exhaustive for the use case — cover every realistic choice
- Add "Other" or "Prefer not to say" where appropriate
- Employment type: ["Full-time", "Part-time", "Contract", "Internship"]
- Yes/No questions: use radio with options ["Yes", "No"]
- Keep each option concise: 4–5 words maximum

## helpText Rules

- Include only when it genuinely reduces confusion or prevents errors
- Good uses: file format requirements, character limits, clarification of an ambiguous question
- Bad uses: restating the label, generic filler like "Please fill this in carefully"

## Required vs Optional

- required: true for fields essential to process the submission
- required: false for supplementary fields (salary expectations, cover letters, LinkedIn URL)
- Certification and consent checkboxes are ALWAYS required: true

## Form Completeness

Generate every field a real form of this type would need — do not under-generate:
- Job application: 10–16 fields
- Contact form: 3–5 fields
- Event registration: 5–9 fields
- Survey: 6–12 fields
Never generate redundant fields or fields that obviously do not belong to the form type.`

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

  const { description, isDemo, apiKey } = body

  if (apiKey !== undefined && apiKey !== null) {
    if (typeof apiKey !== 'string' || !apiKey.startsWith('sk-ant-')) {
      return NextResponse.json({ error: 'Invalid API key format' }, { status: 400 })
    }
  }

  if (!description || description.trim().length < 10) {
    return NextResponse.json(
      { error: 'Description must be at least 10 characters' },
      { status: 400 }
    )
  }

  let demoIp: string | null = null
  if (isDemo && !apiKey) {
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

  const client = apiKey
    ? new Anthropic({ apiKey })
    : new Anthropic()

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
