import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockSingle = vi.hoisted(() => vi.fn())
const mockEqPublished = vi.hoisted(() => vi.fn())
const mockEqId = vi.hoisted(() => vi.fn())
const mockSelect = vi.hoisted(() => vi.fn())
const mockInsert = vi.hoisted(() => vi.fn())
const mockFrom = vi.hoisted(() => vi.fn())

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    from: mockFrom,
  }),
}))

import { POST, OPTIONS } from '../route'

const mockFormWithWebhook = {
  id: 'form-123',
  name: 'Test Form',
  published: true,
  fields: [
    { id: 'name', type: 'text', label: 'Full Name', required: true },
    { id: 'email', type: 'email', label: 'Email', required: false },
  ],
  webhook_url: 'https://example.com/webhook',
}

const mockFormNoWebhook = {
  ...mockFormWithWebhook,
  webhook_url: null,
}

function makePostRequest(body: unknown, formId = 'form-123'): NextRequest {
  return new NextRequest(`http://localhost/api/submit/${formId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  vi.clearAllMocks()

  // Default: form found, insert succeeds
  mockSingle.mockResolvedValue({ data: mockFormWithWebhook, error: null })
  mockEqPublished.mockReturnValue({ single: mockSingle })
  mockEqId.mockReturnValue({ eq: mockEqPublished })
  mockSelect.mockReturnValue({ eq: mockEqId })
  mockInsert.mockResolvedValue({ error: null })
  mockFrom.mockReturnValue({
    select: mockSelect,
    insert: mockInsert,
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('POST /api/submit/[formId]', () => {
  it('returns 201 { success: true } on valid submission', async () => {
    const response = await POST(
      makePostRequest({ name: 'John Doe', email: 'john@example.com' }),
      { params: Promise.resolve({ formId: 'form-123' }) }
    )
    expect(response.status).toBe(201)
    const body = await response.json()
    expect(body).toEqual({ success: true })
  })

  it('returns 400 with missing field labels when required field is absent', async () => {
    const response = await POST(
      makePostRequest({ email: 'john@example.com' }),
      { params: Promise.resolve({ formId: 'form-123' }) }
    )
    expect(response.status).toBe(400)
    const body = await response.json()
    expect(body.error).toBeTruthy()
    expect(body.fields).toContain('Full Name')
  })

  it('returns 404 when form not found', async () => {
    mockSingle.mockResolvedValue({ data: null, error: new Error('not found') })
    const response = await POST(
      makePostRequest({ name: 'John Doe' }),
      { params: Promise.resolve({ formId: 'nonexistent' }) }
    )
    expect(response.status).toBe(404)
  })

  it('returns 404 when form is not published', async () => {
    mockSingle.mockResolvedValue({ data: null, error: new Error('not found') })
    const response = await POST(
      makePostRequest({ name: 'John Doe' }),
      { params: Promise.resolve({ formId: 'form-123' }) }
    )
    expect(response.status).toBe(404)
  })

  it('calls webhook fetch with correct URL when webhook_url is set', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', mockFetch)

    await POST(
      makePostRequest({ name: 'John Doe' }),
      { params: Promise.resolve({ formId: 'form-123' }) }
    )

    // Wait for fire-and-forget
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(mockFetch).toHaveBeenCalledWith(
      'https://example.com/webhook',
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('still returns 201 when webhook fetch rejects', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('timeout')))

    const response = await POST(
      makePostRequest({ name: 'John Doe' }),
      { params: Promise.resolve({ formId: 'form-123' }) }
    )

    // Wait for fire-and-forget rejection to be handled
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(response.status).toBe(201)
  })

  it('does not call fetch when webhook_url is null', async () => {
    mockSingle.mockResolvedValue({ data: mockFormNoWebhook, error: null })
    const mockFetch = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', mockFetch)

    await POST(
      makePostRequest({ name: 'John Doe' }),
      { params: Promise.resolve({ formId: 'form-123' }) }
    )

    await new Promise(resolve => setTimeout(resolve, 0))

    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('has CORS headers on response', async () => {
    const response = await POST(
      makePostRequest({ name: 'John Doe' }),
      { params: Promise.resolve({ formId: 'form-123' }) }
    )
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
  })
})

describe('OPTIONS /api/submit/[formId]', () => {
  it('returns 204 with Access-Control-Allow-Origin: *', () => {
    const response = OPTIONS()
    expect(response.status).toBe(204)
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
  })
})
