import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockGetUser = vi.hoisted(() => vi.fn())
const mockFrom = vi.hoisted(() => vi.fn())
const mockSelect = vi.hoisted(() => vi.fn())
const mockEq = vi.hoisted(() => vi.fn())
const mockSingle = vi.hoisted(() => vi.fn())
const mockUpdate = vi.hoisted(() => vi.fn())
const mockDelete = vi.hoisted(() => vi.fn())

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
  }),
}))

import { GET, PUT, DELETE } from '../../[id]/route'

const validUser = { id: 'user-123', email: 'test@example.com' }
const formData = { id: 'form-123', name: 'Test', user_id: 'user-123' }

function makeGetRequest(): NextRequest {
  return new NextRequest('http://localhost/api/forms/form-123')
}

function makePutRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost/api/forms/form-123', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

function makeDeleteRequest(): NextRequest {
  return new NextRequest('http://localhost/api/forms/form-123', { method: 'DELETE' })
}

beforeEach(() => {
  vi.clearAllMocks()

  // Default: authenticated user
  mockGetUser.mockResolvedValue({ data: { user: validUser } })

  // Default GET chain: from -> select -> eq -> single
  mockSingle.mockResolvedValue({ data: formData, error: null })
  mockEq.mockReturnValue({ single: mockSingle, select: mockSelect })
  mockSelect.mockReturnValue({ eq: mockEq, single: mockSingle })
  mockUpdate.mockReturnValue({ eq: vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ single: mockSingle }) }) })
  mockDelete.mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) })

  mockFrom.mockReturnValue({
    select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: mockSingle }) }),
    update: mockUpdate,
    delete: mockDelete,
  })
})

describe('GET /api/forms/[id]', () => {
  it('returns 200 with form data on success', async () => {
    const res = await GET(makeGetRequest(), { params: Promise.resolve({ id: 'form-123' }) })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.id).toBe('form-123')
    expect(body.name).toBe('Test')
  })

  it('returns 401 when user is null', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const res = await GET(makeGetRequest(), { params: Promise.resolve({ id: 'form-123' }) })
    expect(res.status).toBe(401)
    const body = await res.json()
    expect(body.error).toBe('Unauthorized')
  })

  it('returns 404 when Supabase returns an error', async () => {
    mockSingle.mockResolvedValue({ data: null, error: new Error('not found') })
    const res = await GET(makeGetRequest(), { params: Promise.resolve({ id: 'form-123' }) })
    expect(res.status).toBe(404)
  })
})

describe('PUT /api/forms/[id]', () => {
  it('returns 200 with updated form data', async () => {
    const updatedForm = { ...formData, name: 'Updated Form', updated_at: '2026-03-20T00:00:00.000Z' }
    mockSingle.mockResolvedValue({ data: updatedForm, error: null })

    const res = await PUT(makePutRequest({ name: 'Updated Form' }), { params: Promise.resolve({ id: 'form-123' }) })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.name).toBe('Updated Form')
  })

  it('returns 401 for unauthenticated request', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const res = await PUT(makePutRequest({ name: 'Updated' }), { params: Promise.resolve({ id: 'form-123' }) })
    expect(res.status).toBe(401)
  })

  it('returns 404 when Supabase returns error', async () => {
    const mockEqChain = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({ data: null, error: new Error('not found') }),
      }),
    })
    mockUpdate.mockReturnValue({ eq: mockEqChain })
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ single: mockSingle }) }),
      update: mockUpdate,
      delete: mockDelete,
    })

    const res = await PUT(makePutRequest({ name: 'Updated' }), { params: Promise.resolve({ id: 'form-123' }) })
    expect(res.status).toBe(404)
  })

  it('response body includes updated_at field', async () => {
    const updatedForm = { ...formData, updated_at: '2026-03-20T00:00:00.000Z' }
    mockSingle.mockResolvedValue({ data: updatedForm, error: null })

    const res = await PUT(makePutRequest({ name: 'Test' }), { params: Promise.resolve({ id: 'form-123' }) })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.updated_at).toBeDefined()
  })

  it('accepts partial body (only webhook_url)', async () => {
    const updatedForm = { ...formData, webhook_url: 'https://example.com/hook', updated_at: '2026-03-20T00:00:00.000Z' }
    mockSingle.mockResolvedValue({ data: updatedForm, error: null })

    const res = await PUT(makePutRequest({ webhook_url: 'https://example.com/hook' }), { params: Promise.resolve({ id: 'form-123' }) })
    expect(res.status).toBe(200)
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ webhook_url: 'https://example.com/hook' })
    )
  })
})

describe('DELETE /api/forms/[id]', () => {
  it('returns 204 on success', async () => {
    const res = await DELETE(makeDeleteRequest(), { params: Promise.resolve({ id: 'form-123' }) })
    expect(res.status).toBe(204)
  })

  it('returns 401 for unauthenticated request', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })
    const res = await DELETE(makeDeleteRequest(), { params: Promise.resolve({ id: 'form-123' }) })
    expect(res.status).toBe(401)
  })
})
