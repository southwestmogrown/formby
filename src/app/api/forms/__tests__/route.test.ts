import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockGetUser = vi.hoisted(() => vi.fn())
const mockInsert = vi.hoisted(() => vi.fn())
const mockSelect = vi.hoisted(() => vi.fn())
const mockSingle = vi.hoisted(() => vi.fn())
const mockFrom = vi.hoisted(() => vi.fn())

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
  }),
}))

import { POST, GET } from '../route'

const validUser = { id: 'user-123', email: 'test@example.com' }

const validFields = [
  { id: 'name', type: 'text', label: 'Name', required: true },
]

function makePostRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/forms', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

beforeEach(() => {
  vi.clearAllMocks()

  // Default: authenticated user
  mockGetUser.mockResolvedValue({ data: { user: validUser } })

  // Default insert chain
  mockSingle.mockResolvedValue({
    data: { id: 'form-abc', name: 'Test Form', fields: validFields, published: false },
    error: null,
  })
  mockSelect.mockReturnValue({ single: mockSingle })
  mockInsert.mockReturnValue({ select: mockSelect })
  mockFrom.mockReturnValue({
    insert: mockInsert,
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    }),
  })
})

describe('POST /api/forms', () => {
  it('returns 401 when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const res = await POST(makePostRequest({ name: 'My Form', fields: validFields }))
    expect(res.status).toBe(401)
  })

  it('returns 400 when name is missing', async () => {
    const res = await POST(makePostRequest({ fields: validFields }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toMatch(/name/i)
  })

  it('returns 400 when name is empty string', async () => {
    const res = await POST(makePostRequest({ name: '  ', fields: validFields }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toMatch(/name/i)
  })

  it('returns 400 when fields is not an array', async () => {
    const res = await POST(makePostRequest({ name: 'My Form', fields: 'invalid' }))
    expect(res.status).toBe(400)
    expect((await res.json()).error).toMatch(/array/i)
  })

  it('returns 400 when fields is missing', async () => {
    const res = await POST(makePostRequest({ name: 'My Form' }))
    expect(res.status).toBe(400)
  })

  it('returns 201 with the created form on success', async () => {
    const res = await POST(makePostRequest({ name: 'My Form', fields: validFields, published: false }))
    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.id).toBe('form-abc')
    expect(body.name).toBe('Test Form')
  })

  it('inserts with published: false by default when not provided', async () => {
    await POST(makePostRequest({ name: 'My Form', fields: validFields }))
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ published: false })
    )
  })

  it('inserts with published: true when provided', async () => {
    await POST(makePostRequest({ name: 'My Form', fields: validFields, published: true }))
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ published: true })
    )
  })

  it('inserts with the authenticated user id', async () => {
    await POST(makePostRequest({ name: 'My Form', fields: validFields }))
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'user-123' })
    )
  })

  it('returns 500 when Supabase insert fails', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { message: 'DB error' } })
    const res = await POST(makePostRequest({ name: 'My Form', fields: validFields }))
    expect(res.status).toBe(500)
  })

  it('trims whitespace from name before inserting', async () => {
    await POST(makePostRequest({ name: '  My Form  ', fields: validFields }))
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'My Form' })
    )
  })
})

describe('GET /api/forms', () => {
  it('returns 401 when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const res = await GET()
    expect(res.status).toBe(401)
  })

  it('returns 200 with forms for the authenticated user', async () => {
    const forms = [
      { id: 'form-1', name: 'Form 1', user_id: 'user-123' },
      { id: 'form-2', name: 'Form 2', user_id: 'user-123' },
    ]
    mockFrom.mockReturnValue({
      insert: mockInsert,
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({ data: forms, error: null }),
        }),
      }),
    })

    const res = await GET()
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveLength(2)
  })
})
