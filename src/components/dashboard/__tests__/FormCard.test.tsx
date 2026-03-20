import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import FormCard from '../FormCard'
import type { Form } from '@/lib/types'

vi.mock('next/link', () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode; [key: string]: unknown }) =>
    <a href={href} {...props}>{children}</a>
}))

const sampleForm: Form & { submissions: [{ count: number }] } = {
  id: 'form-1',
  user_id: 'user-1',
  name: 'Contact Form',
  description: 'A contact form',
  fields: [],
  published: true,
  webhook_url: null,
  created_at: '2024-01-15T10:00:00.000Z',
  updated_at: '2024-01-15T10:00:00.000Z',
  submissions: [{ count: 3 }],
}

describe('FormCard', () => {
  it('renders form name', () => {
    render(<FormCard form={sampleForm} />)
    expect(screen.getByText('Contact Form')).toBeInTheDocument()
  })

  it('renders Published badge for published form', () => {
    render(<FormCard form={sampleForm} />)
    expect(screen.getByText('Published')).toBeInTheDocument()
  })

  it('renders Draft badge for unpublished form', () => {
    render(<FormCard form={{ ...sampleForm, published: false }} />)
    expect(screen.getByText('Draft')).toBeInTheDocument()
  })

  it('renders submission count', () => {
    render(<FormCard form={sampleForm} />)
    expect(screen.getByText(/3 submissions/)).toBeInTheDocument()
  })

  it('handles singular submission count', () => {
    render(<FormCard form={{ ...sampleForm, submissions: [{ count: 1 }] }} />)
    expect(screen.getByText(/1 submission/)).toBeInTheDocument()
  })

  it('handles zero submissions', () => {
    render(<FormCard form={{ ...sampleForm, submissions: [{ count: 0 }] }} />)
    expect(screen.getByText(/0 submissions/)).toBeInTheDocument()
  })

  it('Edit link points to /forms/[id]', () => {
    render(<FormCard form={sampleForm} />)
    const editLink = screen.getByRole('link', { name: /edit/i })
    expect(editLink).toHaveAttribute('href', '/forms/form-1')
  })

  it('Embed link points to /forms/[id]/embed', () => {
    render(<FormCard form={sampleForm} />)
    const embedLink = screen.getByRole('link', { name: /embed/i })
    expect(embedLink).toHaveAttribute('href', '/forms/form-1/embed')
  })

  it('Submissions link points to /forms/[id]/submissions', () => {
    render(<FormCard form={sampleForm} />)
    const submissionsLink = screen.getByRole('link', { name: /submissions/i })
    expect(submissionsLink).toHaveAttribute('href', '/forms/form-1/submissions')
  })
})
