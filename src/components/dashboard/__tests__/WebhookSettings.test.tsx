import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import WebhookSettings from '../WebhookSettings'

const defaultProps = {
  formId: 'form-123',
  onSave: vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('WebhookSettings', () => {
  it('renders a URL input', () => {
    render(<WebhookSettings {...defaultProps} />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('input is pre-populated with initialWebhookUrl when provided', () => {
    render(<WebhookSettings {...defaultProps} initialWebhookUrl="https://example.com/webhook" />)
    expect(screen.getByRole('textbox')).toHaveValue('https://example.com/webhook')
  })

  it('Save button is present', () => {
    render(<WebhookSettings {...defaultProps} />)
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
  })

  it('Test button is present', () => {
    render(<WebhookSettings {...defaultProps} />)
    expect(screen.getByRole('button', { name: /test/i })).toBeInTheDocument()
  })

  it('clicking Save calls fetch with PUT /api/forms/form-123 and webhook_url in body', async () => {
    const user = userEvent.setup()
    const mockFetch = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', mockFetch)

    render(<WebhookSettings {...defaultProps} initialWebhookUrl="https://example.com/webhook" />)
    await user.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/forms/form-123', expect.objectContaining({
        method: 'PUT',
      }))
      const body = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(body.webhook_url).toBe('https://example.com/webhook')
    })
  })

  it('successful save shows "Saved!" text', async () => {
    const user = userEvent.setup()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))

    render(<WebhookSettings {...defaultProps} initialWebhookUrl="https://example.com/webhook" />)
    await user.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
      expect(screen.getByText('Saved!')).toBeInTheDocument()
    })
  })

  it('failed save shows error text', async () => {
    const user = userEvent.setup()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))

    render(<WebhookSettings {...defaultProps} initialWebhookUrl="https://example.com/webhook" />)
    await user.click(screen.getByRole('button', { name: /save/i }))

    await waitFor(() => {
      expect(screen.getByText('Error saving')).toBeInTheDocument()
    })
  })

  it('clicking Test calls fetch with POST /api/webhook/test', async () => {
    const user = userEvent.setup()
    const mockFetch = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', mockFetch)

    render(<WebhookSettings {...defaultProps} initialWebhookUrl="https://example.com/webhook" />)
    await user.click(screen.getByRole('button', { name: /test/i }))

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/webhook/test', expect.objectContaining({
        method: 'POST',
      }))
    })
  })

  it('successful test shows "Webhook responded successfully!" text', async () => {
    const user = userEvent.setup()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }))

    render(<WebhookSettings {...defaultProps} initialWebhookUrl="https://example.com/webhook" />)
    await user.click(screen.getByRole('button', { name: /test/i }))

    await waitFor(() => {
      expect(screen.getByText('Webhook responded successfully!')).toBeInTheDocument()
    })
  })

  it('failed test shows error text', async () => {
    const user = userEvent.setup()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))

    render(<WebhookSettings {...defaultProps} initialWebhookUrl="https://example.com/webhook" />)
    await user.click(screen.getByRole('button', { name: /test/i }))

    await waitFor(() => {
      expect(screen.getByText('Webhook test failed')).toBeInTheDocument()
    })
  })
})
