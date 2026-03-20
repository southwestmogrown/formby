import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PromptInput from '../PromptInput'
import type { FormField } from '@/lib/types'

const mockFields: FormField[] = [
  { id: 'name', type: 'text', label: 'Full Name', required: true },
  { id: 'email', type: 'email', label: 'Email', required: true },
]

const defaultProps = {
  onGenerate: vi.fn(),
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('PromptInput', () => {
  it('renders a textarea', () => {
    render(<PromptInput {...defaultProps} />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('renders all four example prompt pills', () => {
    render(<PromptInput {...defaultProps} />)
    expect(screen.getByText('Contact form with name, email, and message')).toBeInTheDocument()
    expect(screen.getByText('Job application with resume upload and experience fields')).toBeInTheDocument()
    expect(screen.getByText('Event registration with dietary restrictions and t-shirt size')).toBeInTheDocument()
    expect(screen.getByText('Customer feedback survey with star ratings')).toBeInTheDocument()
  })

  it('clicking an example prompt populates the textarea', async () => {
    const user = userEvent.setup()
    render(<PromptInput {...defaultProps} />)
    await user.click(screen.getByText('Contact form with name, email, and message'))
    expect(screen.getByRole('textbox')).toHaveValue('Contact form with name, email, and message')
  })

  it('Generate button is disabled when textarea is empty', () => {
    render(<PromptInput {...defaultProps} />)
    expect(screen.getByRole('button', { name: /generate form/i })).toBeDisabled()
  })

  it('Generate button remains disabled when text is fewer than 10 characters', async () => {
    const user = userEvent.setup()
    render(<PromptInput {...defaultProps} />)
    await user.type(screen.getByRole('textbox'), 'Short')
    expect(screen.getByRole('button', { name: /generate form/i })).toBeDisabled()
  })

  it('Generate button enables when text is at least 10 characters', async () => {
    const user = userEvent.setup()
    render(<PromptInput {...defaultProps} />)
    await user.type(screen.getByRole('textbox'), 'A contact form')
    expect(screen.getByRole('button', { name: /generate form/i })).not.toBeDisabled()
  })

  it('shows loading state during API call', async () => {
    const user = userEvent.setup()
    // Never resolve so we can inspect the loading state
    vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})))

    render(<PromptInput {...defaultProps} />)
    await user.type(screen.getByRole('textbox'), 'A contact form with name and email')
    await user.click(screen.getByRole('button', { name: /generate form/i }))

    expect(screen.getByRole('button', { name: /generating/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /generating/i })).toBeDisabled()

    vi.unstubAllGlobals()
  })

  it('calls onGenerate with fields, name, and description on success', async () => {
    const user = userEvent.setup()
    const onGenerate = vi.fn()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ name: 'Contact Form', fields: mockFields }),
    }))

    render(<PromptInput onGenerate={onGenerate} />)
    await user.type(screen.getByRole('textbox'), 'A contact form with name and email')
    await user.click(screen.getByRole('button', { name: /generate form/i }))

    await waitFor(() => {
      expect(onGenerate).toHaveBeenCalledWith(mockFields, 'Contact Form', 'A contact form with name and email')
    })

    vi.unstubAllGlobals()
  })

  it('shows error message when API returns non-200', async () => {
    const user = userEvent.setup()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Description must be at least 10 characters' }),
    }))

    render(<PromptInput {...defaultProps} />)
    await user.type(screen.getByRole('textbox'), 'A contact form with name and email')
    await user.click(screen.getByRole('button', { name: /generate form/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Description must be at least 10 characters')
    })

    vi.unstubAllGlobals()
  })

  it('shows network error message when fetch throws', async () => {
    const user = userEvent.setup()
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')))

    render(<PromptInput {...defaultProps} />)
    await user.type(screen.getByRole('textbox'), 'A contact form with name and email')
    await user.click(screen.getByRole('button', { name: /generate form/i }))

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/network error/i)
    })

    vi.unstubAllGlobals()
  })

  it('re-enables the button after an error so the user can retry', async () => {
    const user = userEvent.setup()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Something went wrong' }),
    }))

    render(<PromptInput {...defaultProps} />)
    await user.type(screen.getByRole('textbox'), 'A contact form with name and email')
    await user.click(screen.getByRole('button', { name: /generate form/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /generate form/i })).not.toBeDisabled()
    })

    vi.unstubAllGlobals()
  })

  it('disables textarea and pills when disabled prop is true', () => {
    render(<PromptInput {...defaultProps} disabled />)
    expect(screen.getByRole('textbox')).toBeDisabled()
    for (const prompt of screen.getAllByRole('button')) {
      expect(prompt).toBeDisabled()
    }
  })

  it('shows demo generations remaining when isDemo is true', () => {
    render(<PromptInput {...defaultProps} isDemo demoGenerationsRemaining={2} />)
    expect(screen.getByText(/2 generations remaining/i)).toBeInTheDocument()
  })

  it('uses singular "generation" when 1 remains', () => {
    render(<PromptInput {...defaultProps} isDemo demoGenerationsRemaining={1} />)
    expect(screen.getByText(/1 generation remaining/i)).toBeInTheDocument()
  })

  it('sends isDemo flag to the API when isDemo is true', async () => {
    const user = userEvent.setup()
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ name: 'Form', fields: [] }),
    })
    vi.stubGlobal('fetch', mockFetch)

    render(<PromptInput onGenerate={vi.fn()} isDemo />)
    await user.type(screen.getByRole('textbox'), 'A contact form with name and email')
    await user.click(screen.getByRole('button', { name: /generate form/i }))

    await waitFor(() => {
      const body = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(body.isDemo).toBe(true)
    })

    vi.unstubAllGlobals()
  })
})
