import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import EmbedCodeBlock from '../EmbedCodeBlock'

let writeText: ReturnType<typeof vi.fn>

beforeEach(() => {
  vi.useFakeTimers()
  writeText = vi.fn().mockResolvedValue(undefined)
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText },
    configurable: true,
    writable: true,
  })
})

afterEach(() => {
  vi.useRealTimers()
})

describe('EmbedCodeBlock', () => {
  it('renders iframe code containing /embed/the-form-id', () => {
    render(<EmbedCodeBlock formId="the-form-id" />)
    const matches = screen.getAllByText(/\/embed\/the-form-id/)
    expect(matches.length).toBeGreaterThanOrEqual(1)
  })

  it('renders script code containing /embed/the-form-id/widget.js', () => {
    render(<EmbedCodeBlock formId="the-form-id" />)
    expect(screen.getByText(/\/embed\/the-form-id\/widget\.js/)).toBeInTheDocument()
  })

  it('renders two copy buttons', () => {
    render(<EmbedCodeBlock formId="the-form-id" />)
    const copyButtons = screen.getAllByRole('button', { name: /copy/i })
    expect(copyButtons).toHaveLength(2)
  })

  it('clicking the iframe copy button calls navigator.clipboard.writeText with the iframe code', async () => {
    render(<EmbedCodeBlock formId="the-form-id" />)
    const [iframeCopyButton] = screen.getAllByRole('button', { name: /copy/i })
    await act(async () => { fireEvent.click(iframeCopyButton) })
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('<iframe'))
    expect(writeText).toHaveBeenCalledWith(expect.stringContaining('/embed/the-form-id'))
  })

  it('after clicking iframe copy button, shows "Copied!" text on that button', async () => {
    render(<EmbedCodeBlock formId="the-form-id" />)
    const [iframeCopyButton] = screen.getAllByRole('button', { name: /copy/i })
    await act(async () => { fireEvent.click(iframeCopyButton) })
    expect(iframeCopyButton).toHaveTextContent('Copied!')
  })

  it('"Copied!" reverts to "Copy" after 2 seconds', async () => {
    render(<EmbedCodeBlock formId="the-form-id" />)
    const [iframeCopyButton] = screen.getAllByRole('button', { name: /copy/i })
    await act(async () => { fireEvent.click(iframeCopyButton) })
    expect(iframeCopyButton).toHaveTextContent('Copied!')
    act(() => { vi.advanceTimersByTime(2000) })
    expect(iframeCopyButton).toHaveTextContent('Copy')
  })

  it('clicking script copy button shows "Copied!" on the script button but not the iframe button', async () => {
    render(<EmbedCodeBlock formId="the-form-id" />)
    const [iframeCopyButton, scriptCopyButton] = screen.getAllByRole('button', { name: /copy/i })
    await act(async () => { fireEvent.click(scriptCopyButton) })
    expect(scriptCopyButton).toHaveTextContent('Copied!')
    expect(iframeCopyButton).toHaveTextContent('Copy')
  })
})
