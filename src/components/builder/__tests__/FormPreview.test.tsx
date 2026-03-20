import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import FormPreview from '../FormPreview'
import type { FormField } from '@/lib/types'

function field(overrides: Partial<FormField> & Pick<FormField, 'type'>): FormField {
  return {
    id: `field_${overrides.type}`,
    label: overrides.label ?? overrides.type,
    required: false,
    ...overrides,
  }
}

describe('FormPreview', () => {
  it('renders the form name', () => {
    render(<FormPreview name="My Contact Form" fields={[]} />)
    expect(screen.getByText('My Contact Form')).toBeInTheDocument()
  })

  it('shows "Untitled Form" when name is empty', () => {
    render(<FormPreview name="" fields={[]} />)
    expect(screen.getByText('Untitled Form')).toBeInTheDocument()
  })

  it('shows empty state message when fields array is empty', () => {
    render(<FormPreview name="Form" fields={[]} />)
    expect(screen.getByText(/no fields yet/i)).toBeInTheDocument()
  })

  it('shows "Preview only" badge', () => {
    render(<FormPreview name="Form" fields={[]} />)
    expect(screen.getByText(/preview only/i)).toBeInTheDocument()
  })

  it('text field renders an input[type=text]', () => {
    render(<FormPreview name="Form" fields={[field({ type: 'text', label: 'Name' })]} />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
  })

  it('email field renders an input[type=email]', () => {
    render(<FormPreview name="Form" fields={[field({ type: 'email', label: 'Email' })]} />)
    const input = document.querySelector('input[type="email"]')
    expect(input).toBeInTheDocument()
  })

  it('phone field renders an input[type=tel]', () => {
    render(<FormPreview name="Form" fields={[field({ type: 'phone', label: 'Phone' })]} />)
    const input = document.querySelector('input[type="tel"]')
    expect(input).toBeInTheDocument()
  })

  it('number field renders an input[type=number]', () => {
    render(<FormPreview name="Form" fields={[field({ type: 'number', label: 'Age' })]} />)
    const input = document.querySelector('input[type="number"]')
    expect(input).toBeInTheDocument()
  })

  it('date field renders an input[type=date]', () => {
    render(<FormPreview name="Form" fields={[field({ type: 'date', label: 'Birthday' })]} />)
    const input = document.querySelector('input[type="date"]')
    expect(input).toBeInTheDocument()
  })

  it('textarea field renders a <textarea>', () => {
    render(<FormPreview name="Form" fields={[field({ type: 'textarea', label: 'Message' })]} />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(document.querySelector('textarea')).toBeInTheDocument()
  })

  it('select field renders a <select> with option elements', () => {
    render(
      <FormPreview
        name="Form"
        fields={[field({ type: 'select', label: 'Country', options: ['UK', 'US', 'CA'] })]}
      />
    )
    const select = screen.getByRole('combobox')
    expect(select).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'UK' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'US' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'CA' })).toBeInTheDocument()
  })

  it('select field shows placeholder message when options array is empty', () => {
    render(
      <FormPreview
        name="Form"
        fields={[field({ type: 'select', label: 'Category', options: [] })]}
      />
    )
    expect(screen.getByText(/no options defined/i)).toBeInTheDocument()
  })

  it('radio field renders radio inputs for each option', () => {
    render(
      <FormPreview
        name="Form"
        fields={[field({ type: 'radio', label: 'Size', options: ['S', 'M', 'L'] })]}
      />
    )
    const radios = document.querySelectorAll('input[type="radio"]')
    expect(radios).toHaveLength(3)
  })

  it('radio field shows placeholder message when options array is empty', () => {
    render(
      <FormPreview
        name="Form"
        fields={[field({ type: 'radio', label: 'Choice', options: [] })]}
      />
    )
    expect(screen.getByText(/no options defined/i)).toBeInTheDocument()
  })

  it('single checkbox field renders an input[type=checkbox] with label inline', () => {
    render(
      <FormPreview
        name="Form"
        fields={[field({ type: 'checkbox', label: 'I agree to the terms' })]}
      />
    )
    expect(document.querySelector('input[type="checkbox"]')).toBeInTheDocument()
    expect(screen.getByText('I agree to the terms')).toBeInTheDocument()
  })

  it('checkbox group renders one checkbox per option', () => {
    render(
      <FormPreview
        name="Form"
        fields={[field({ type: 'checkbox', label: 'Preferences', options: ['Email', 'SMS', 'Push'] })]}
      />
    )
    const checkboxes = document.querySelectorAll('input[type="checkbox"]')
    expect(checkboxes).toHaveLength(3)
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('SMS')).toBeInTheDocument()
    expect(screen.getByText('Push')).toBeInTheDocument()
  })

  it('required text fields show a red asterisk next to the label', () => {
    render(
      <FormPreview
        name="Form"
        fields={[field({ type: 'text', label: 'Full Name', required: true })]}
      />
    )
    expect(screen.getByLabelText('required')).toBeInTheDocument()
  })

  it('required single checkbox shows asterisk inline in its label', () => {
    render(
      <FormPreview
        name="Form"
        fields={[field({ type: 'checkbox', label: 'I agree', required: true })]}
      />
    )
    expect(screen.getByLabelText('required')).toBeInTheDocument()
  })

  it('non-required fields do not show asterisk', () => {
    render(
      <FormPreview
        name="Form"
        fields={[field({ type: 'text', label: 'Optional', required: false })]}
      />
    )
    expect(screen.queryByLabelText('required')).not.toBeInTheDocument()
  })

  it('help text renders below the field in muted style', () => {
    render(
      <FormPreview
        name="Form"
        fields={[field({ type: 'text', label: 'Name', helpText: 'Enter your full legal name' })]}
      />
    )
    expect(screen.getByText('Enter your full legal name')).toBeInTheDocument()
  })

  it('renders placeholder text on text input', () => {
    render(
      <FormPreview
        name="Form"
        fields={[field({ type: 'text', label: 'Name', placeholder: 'e.g. John Doe' })]}
      />
    )
    expect(screen.getByPlaceholderText('e.g. John Doe')).toBeInTheDocument()
  })

  it('renders multiple fields in order', () => {
    const fields: FormField[] = [
      { id: 'f1', type: 'text', label: 'First', required: false },
      { id: 'f2', type: 'email', label: 'Second', required: false },
      { id: 'f3', type: 'textarea', label: 'Third', required: false },
    ]
    render(<FormPreview name="Form" fields={fields} />)
    const labels = screen.getAllByText(/First|Second|Third/)
    expect(labels[0]).toHaveTextContent('First')
    expect(labels[1]).toHaveTextContent('Second')
    expect(labels[2]).toHaveTextContent('Third')
  })
})
