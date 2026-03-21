import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

// vi.hoisted ensures mockCreate is available when vi.mock factory runs (hoisting)
const mockCreate = vi.hoisted(() => vi.fn())

vi.mock('@anthropic-ai/sdk', () => ({
  default: class MockAnthropic {
    messages = { create: mockCreate }
  },
}))

// Import AFTER mocks are set up
import { POST } from '../route'

function makeRequest(body: unknown, ip = '1.2.3.4'): NextRequest {
  return new NextRequest('http://localhost/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-forwarded-for': ip,
    },
    body: JSON.stringify(body),
  })
}

// Authenticated (non-demo) requests require an API key
function makeAuthRequest(description: string, ip = '1.2.3.4'): NextRequest {
  return makeRequest({ description, apiKey: 'sk-ant-test' }, ip)
}

const validClaudeResponse = JSON.stringify({
  name: 'Contact Form',
  fields: [
    { id: 'name', type: 'text', label: 'Full Name', required: true },
    { id: 'email', type: 'email', label: 'Email Address', required: true },
  ],
})

beforeEach(() => {
  vi.clearAllMocks()
})

describe('POST /api/generate', () => {
  it('returns 400 when description is missing', async () => {
    const res = await POST(makeRequest({}))
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toMatch(/10 characters/)
  })

  it('returns 400 when description is fewer than 10 characters', async () => {
    const res = await POST(makeRequest({ description: 'short' }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toMatch(/10 characters/)
  })

  it('returns 400 when description is exactly 9 characters', async () => {
    const res = await POST(makeRequest({ description: '123456789' }))
    expect(res.status).toBe(400)
  })

  it('accepts description of exactly 10 characters', async () => {
    mockCreate.mockResolvedValue({ content: [{ type: 'text', text: validClaudeResponse }] })
    const res = await POST(makeAuthRequest('1234567890'))
    expect(res.status).toBe(200)
  })

  it('returns 200 with parsed response when Claude returns valid JSON', async () => {
    mockCreate.mockResolvedValue({ content: [{ type: 'text', text: validClaudeResponse }] })
    const res = await POST(makeAuthRequest('A simple contact form with name and email'))
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.name).toBe('Contact Form')
    expect(Array.isArray(body.fields)).toBe(true)
    expect(body.fields).toHaveLength(2)
  })

  it('strips leading/trailing whitespace from description before calling Claude', async () => {
    mockCreate.mockResolvedValue({ content: [{ type: 'text', text: validClaudeResponse }] })
    await POST(makeRequest({ description: '  A simple contact form with name and email  ', apiKey: 'sk-ant-test' }))
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: [{ role: 'user', content: 'A simple contact form with name and email' }],
      })
    )
  })

  it('returns 500 when Claude returns non-JSON text', async () => {
    mockCreate.mockResolvedValue({ content: [{ type: 'text', text: 'Sure! Here is your form...' }] })
    const res = await POST(makeAuthRequest('A simple contact form with name and email'))
    expect(res.status).toBe(500)
    expect((await res.json()).error).toMatch(/parse/i)
  })

  it('returns 500 when Claude returns JSON missing required fields', async () => {
    mockCreate.mockResolvedValue({ content: [{ type: 'text', text: JSON.stringify({ unexpected: true }) }] })
    const res = await POST(makeAuthRequest('A simple contact form with name and email'))
    expect(res.status).toBe(500)
    expect((await res.json()).error).toMatch(/shape/i)
  })

  it('returns 500 when fields is not an array', async () => {
    mockCreate.mockResolvedValue({ content: [{ type: 'text', text: JSON.stringify({ name: 'Form', fields: 'oops' }) }] })
    const res = await POST(makeAuthRequest('A simple contact form with name and email'))
    expect(res.status).toBe(500)
  })

  it('returns 502 when Anthropic throws', async () => {
    mockCreate.mockRejectedValue(new Error('API key invalid'))
    const res = await POST(makeAuthRequest('A simple contact form with name and email'))
    expect(res.status).toBe(502)
  })

  it('does not rate-limit non-demo requests regardless of count', async () => {
    mockCreate.mockResolvedValue({ content: [{ type: 'text', text: validClaudeResponse }] })
    for (let i = 0; i < 5; i++) {
      const res = await POST(makeAuthRequest('A simple contact form with name and email', '5.5.5.5'))
      expect(res.status).toBe(200)
    }
  })

  it('returns 429 for demo requests that exceed the limit', async () => {
    mockCreate.mockResolvedValue({ content: [{ type: 'text', text: validClaudeResponse }] })
    const ip = '9.9.9.1'
    const limit = parseInt(process.env.DEMO_GENERATION_LIMIT ?? '3', 10)

    for (let i = 0; i < limit; i++) {
      const res = await POST(makeRequest({ description: 'A simple contact form with name and email', isDemo: true }, ip))
      expect(res.status).toBe(200)
    }

    const res = await POST(makeRequest({ description: 'A simple contact form with name and email', isDemo: true }, ip))
    expect(res.status).toBe(429)
    expect((await res.json()).error).toMatch(/limit/i)
  })

  it('rate-limits per IP, not globally', async () => {
    mockCreate.mockResolvedValue({ content: [{ type: 'text', text: validClaudeResponse }] })
    const limit = parseInt(process.env.DEMO_GENERATION_LIMIT ?? '3', 10)

    for (let i = 0; i < limit; i++) {
      await POST(makeRequest({ description: 'A simple contact form with name and email', isDemo: true }, '10.0.0.1'))
    }

    // Different IP should still be allowed
    const res = await POST(makeRequest({ description: 'A simple contact form with name and email', isDemo: true }, '10.0.0.2'))
    expect(res.status).toBe(200)
  })
})
