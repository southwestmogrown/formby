import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockSingle = vi.hoisted(() => vi.fn())
const mockEqPublished = vi.hoisted(() => vi.fn())
const mockEqId = vi.hoisted(() => vi.fn())
const mockSelect = vi.hoisted(() => vi.fn())
const mockFrom = vi.hoisted(() => vi.fn())

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    from: mockFrom,
  }),
}))

import { GET, OPTIONS } from '../route'

const mockForm = {
  id: 'form-123',
  name: 'Test Form',
  published: true,
  fields: [
    { id: 'f1', type: 'text', label: 'Full Name', required: true },
    { id: 'f2', type: 'email', label: 'Email', required: false },
  ],
  webhook_url: null,
}

beforeEach(() => {
  vi.clearAllMocks()

  mockSingle.mockResolvedValue({ data: mockForm, error: null })
  mockEqPublished.mockReturnValue({ single: mockSingle })
  mockEqId.mockReturnValue({ eq: mockEqPublished })
  mockSelect.mockReturnValue({ eq: mockEqId })
  mockFrom.mockReturnValue({ select: mockSelect })
})

describe('GET /embed/[formId]', () => {
  it('returns 200 with content-type text/html for a published form', async () => {
    const response = await GET(
      new Request('http://localhost/embed/form-123'),
      { params: Promise.resolve({ formId: 'form-123' }) }
    )
    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toContain('text/html')
  })

  it('returns 404 when Supabase returns an error', async () => {
    mockSingle.mockResolvedValue({ data: null, error: new Error('not found') })
    const response = await GET(
      new Request('http://localhost/embed/form-123'),
      { params: Promise.resolve({ formId: 'form-123' }) }
    )
    expect(response.status).toBe(404)
  })

  it('returns 404 when form is not published', async () => {
    mockSingle.mockResolvedValue({ data: null, error: new Error('not found') })
    const response = await GET(
      new Request('http://localhost/embed/form-999'),
      { params: Promise.resolve({ formId: 'form-999' }) }
    )
    expect(response.status).toBe(404)
  })

  it('response HTML contains <form element', async () => {
    const response = await GET(
      new Request('http://localhost/embed/form-123'),
      { params: Promise.resolve({ formId: 'form-123' }) }
    )
    const html = await response.text()
    expect(html).toContain('<form')
  })

  it('response HTML contains field labels', async () => {
    const response = await GET(
      new Request('http://localhost/embed/form-123'),
      { params: Promise.resolve({ formId: 'form-123' }) }
    )
    const html = await response.text()
    expect(html).toContain('Full Name')
    expect(html).toContain('Email')
  })

  it('response has CORS headers', async () => {
    const response = await GET(
      new Request('http://localhost/embed/form-123'),
      { params: Promise.resolve({ formId: 'form-123' }) }
    )
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
  })
})

describe('OPTIONS /embed/[formId]', () => {
  it('returns 204 with Access-Control-Allow-Origin: *', () => {
    const response = OPTIONS()
    expect(response.status).toBe(204)
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
  })
})
