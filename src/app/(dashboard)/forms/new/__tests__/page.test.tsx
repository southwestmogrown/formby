import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock next/navigation
const mockPush = vi.hoisted(() => vi.fn())
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

// Mock apiKey — return a stored key so generate isn't disabled
vi.mock('@/lib/apiKey', () => ({
  getApiKey: () => 'sk-ant-test',
}))

import NewFormPage from '../NewFormPage'

const generatedFields = [
  { id: 'name', type: 'text', label: 'Full Name', required: true },
  { id: 'email', type: 'email', label: 'Email', required: true },
]

function mockSuccessfulGenerate() {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ name: 'Contact Form', fields: generatedFields }),
  }))
}

function mockSuccessfulSave(id = 'form-abc') {
  vi.stubGlobal('fetch', vi.fn()
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ name: 'Contact Form', fields: generatedFields }),
    })
    .mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id, name: 'Contact Form' }),
    })
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.unstubAllGlobals()
})

describe('NewFormPage', () => {
  it('renders in empty phase showing PromptInput and no field list', () => {
    render(<NewFormPage userId="test-user-id" />)
    // The textarea is the description input; it has a placeholder but no explicit accessible name
    expect(screen.getAllByRole('textbox')[0]).toBeInTheDocument()
    // In empty phase, the generated-state controls (Save Draft, Publish) are absent
    expect(screen.queryByRole('button', { name: /save draft/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /publish/i })).not.toBeInTheDocument()
  })

  it('shows the page heading in empty phase', () => {
    render(<NewFormPage userId="test-user-id" />)
    expect(screen.getByRole('heading', { name: /create a new form/i })).toBeInTheDocument()
  })

  it('transitions to generated phase after successful generation', async () => {
    const user = userEvent.setup()
    mockSuccessfulGenerate()
    render(<NewFormPage userId="test-user-id" />)

    await user.type(screen.getAllByRole('textbox')[0], 'A contact form with name and email')
    await user.click(screen.getByRole('button', { name: /generate form/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save draft/i })).toBeInTheDocument()
    })
    expect(screen.getByRole('button', { name: /publish/i })).toBeInTheDocument()
  })

  it('shows FieldList and FormPreview in generated phase', async () => {
    const user = userEvent.setup()
    mockSuccessfulGenerate()
    render(<NewFormPage userId="test-user-id" />)

    await user.type(screen.getAllByRole('textbox')[0], 'A contact form with name and email')
    await user.click(screen.getByRole('button', { name: /generate form/i }))

    await waitFor(() => {
      // FieldList renders field label inputs
      const labelInputs = screen.getAllByRole('textbox', { name: /field label/i })
      expect(labelInputs.length).toBeGreaterThan(0)
    })
    // FormPreview renders the form name
    expect(screen.getByText('Contact Form')).toBeInTheDocument()
  })

  it('clicking Regenerate goes back to empty phase', async () => {
    const user = userEvent.setup()
    mockSuccessfulGenerate()
    render(<NewFormPage userId="test-user-id" />)

    await user.type(screen.getAllByRole('textbox')[0], 'A contact form with name and email')
    await user.click(screen.getByRole('button', { name: /generate form/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save draft/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /regenerate/i }))

    expect(screen.getByRole('heading', { name: /create a new form/i })).toBeInTheDocument()
  })

  it('Save Draft POSTs with published: false and redirects to /forms/[id]', async () => {
    const user = userEvent.setup()
    mockSuccessfulSave('form-xyz')
    render(<NewFormPage userId="test-user-id" />)

    await user.type(screen.getAllByRole('textbox')[0], 'A contact form with name and email')
    await user.click(screen.getByRole('button', { name: /generate form/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save draft/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /save draft/i }))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/forms/form-xyz')
    })

    const fetchCalls = (fetch as ReturnType<typeof vi.fn>).mock.calls
    const saveCall = fetchCalls[1]
    expect(saveCall[0]).toBe('/api/forms')
    expect(JSON.parse(saveCall[1].body).published).toBe(false)
  })

  it('Publish POSTs with published: true and redirects to /forms/[id]/embed', async () => {
    const user = userEvent.setup()
    mockSuccessfulSave('form-xyz')
    render(<NewFormPage userId="test-user-id" />)

    await user.type(screen.getAllByRole('textbox')[0], 'A contact form with name and email')
    await user.click(screen.getByRole('button', { name: /generate form/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /publish/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /publish/i }))

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/forms/form-xyz/embed')
    })

    const fetchCalls = (fetch as ReturnType<typeof vi.fn>).mock.calls
    const saveCall = fetchCalls[1]
    expect(JSON.parse(saveCall[1].body).published).toBe(true)
  })

  it('shows error alert when save fails', async () => {
    const user = userEvent.setup()
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ name: 'Contact Form', fields: generatedFields }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Database error' }),
      })
    )

    render(<NewFormPage userId="test-user-id" />)
    await user.type(screen.getAllByRole('textbox')[0], 'A contact form with name and email')
    await user.click(screen.getByRole('button', { name: /generate form/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save draft/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /save draft/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Database error')
    })
    expect(mockPush).not.toHaveBeenCalled()
  })

  it('disables save buttons while saving', async () => {
    const user = userEvent.setup()
    vi.stubGlobal('fetch', vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ name: 'Contact Form', fields: generatedFields }),
      })
      .mockImplementationOnce(() => new Promise(() => {})) // Never resolves
    )

    render(<NewFormPage userId="test-user-id" />)
    await user.type(screen.getAllByRole('textbox')[0], 'A contact form with name and email')
    await user.click(screen.getByRole('button', { name: /generate form/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save draft/i })).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /save draft/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled()
    })
  })
})
