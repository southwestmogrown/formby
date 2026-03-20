import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState as useReactState } from 'react'
import FieldEditor from '../FieldEditor'
import type { FormField } from '@/lib/types'

const baseField: FormField = {
  id: 'test_field',
  type: 'text',
  label: 'Full Name',
  required: false,
}

function makeProps(overrides: Partial<FormField> = {}) {
  return {
    field: { ...baseField, ...overrides },
    onChange: vi.fn(),
    onDelete: vi.fn(),
  }
}

/**
 * Renders FieldEditor with real state management so onChange actually updates
 * the displayed value between keystrokes (necessary for controlled inputs).
 */
function renderStateful(initial: Partial<FormField> = {}) {
  const initialField = { ...baseField, ...initial }
  const onChange = vi.fn()
  const onDelete = vi.fn()

  function Wrapper() {
    const [field, setField] = useReactState<FormField>(initialField)
    return (
      <FieldEditor
        field={field}
        onChange={(f) => { setField(f); onChange(f) }}
        onDelete={onDelete}
      />
    )
  }

  render(<Wrapper />)
  return { onChange, onDelete }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('FieldEditor', () => {
  it('renders the field type dropdown with the current type selected', () => {
    render(<FieldEditor {...makeProps({ type: 'email' })} />)
    const select = screen.getByRole('combobox', { name: /field type/i })
    expect(select).toHaveValue('email')
  })

  it('renders the label input with the current label value', () => {
    render(<FieldEditor {...makeProps()} />)
    expect(screen.getByRole('textbox', { name: /field label/i })).toHaveValue('Full Name')
  })

  it('renders the required checkbox unchecked when required is false', () => {
    render(<FieldEditor {...makeProps({ required: false })} />)
    expect(screen.getByRole('checkbox', { name: /required/i })).not.toBeChecked()
  })

  it('renders the required checkbox checked when required is true', () => {
    render(<FieldEditor {...makeProps({ required: true })} />)
    expect(screen.getByRole('checkbox', { name: /required/i })).toBeChecked()
  })

  it('shows placeholder input for text type', () => {
    render(<FieldEditor {...makeProps({ type: 'text' })} />)
    expect(screen.getByRole('textbox', { name: /placeholder/i })).toBeInTheDocument()
  })

  it('shows placeholder input for email type', () => {
    render(<FieldEditor {...makeProps({ type: 'email' })} />)
    expect(screen.getByRole('textbox', { name: /placeholder/i })).toBeInTheDocument()
  })

  it('shows placeholder input for phone type', () => {
    render(<FieldEditor {...makeProps({ type: 'phone' })} />)
    expect(screen.getByRole('textbox', { name: /placeholder/i })).toBeInTheDocument()
  })

  it('shows placeholder input for textarea type', () => {
    render(<FieldEditor {...makeProps({ type: 'textarea' })} />)
    expect(screen.getByRole('textbox', { name: /placeholder/i })).toBeInTheDocument()
  })

  it('shows placeholder input for number type', () => {
    render(<FieldEditor {...makeProps({ type: 'number' })} />)
    expect(screen.getByRole('textbox', { name: /placeholder/i })).toBeInTheDocument()
  })

  it('hides placeholder input for date type', () => {
    render(<FieldEditor {...makeProps({ type: 'date' })} />)
    expect(screen.queryByRole('textbox', { name: /placeholder/i })).not.toBeInTheDocument()
  })

  it('hides placeholder for select type', () => {
    render(<FieldEditor {...makeProps({ type: 'select', options: ['A', 'B'] })} />)
    expect(screen.queryByRole('textbox', { name: /placeholder/i })).not.toBeInTheDocument()
  })

  it('shows options input for select type', () => {
    render(<FieldEditor {...makeProps({ type: 'select', options: ['A', 'B'] })} />)
    expect(screen.getByRole('textbox', { name: /options/i })).toBeInTheDocument()
  })

  it('shows options input for radio type', () => {
    render(<FieldEditor {...makeProps({ type: 'radio', options: ['Yes', 'No'] })} />)
    expect(screen.getByRole('textbox', { name: /options/i })).toBeInTheDocument()
  })

  it('shows options input for checkbox type', () => {
    render(<FieldEditor {...makeProps({ type: 'checkbox', options: ['A'] })} />)
    expect(screen.getByRole('textbox', { name: /options/i })).toBeInTheDocument()
  })

  it('hides options input for text type', () => {
    render(<FieldEditor {...makeProps({ type: 'text' })} />)
    expect(screen.queryByRole('textbox', { name: /options/i })).not.toBeInTheDocument()
  })

  it('displays current options as comma-separated string', () => {
    render(<FieldEditor {...makeProps({ type: 'select', options: ['Red', 'Green', 'Blue'] })} />)
    expect(screen.getByRole('textbox', { name: /options/i })).toHaveValue('Red, Green, Blue')
  })

  it('calls onChange when label changes', async () => {
    const user = userEvent.setup()
    const { onChange } = renderStateful()
    const input = screen.getByRole('textbox', { name: /field label/i })
    await user.clear(input)
    await user.type(input, 'New Label')
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ label: 'New Label' })
    )
  })

  it('calls onChange when type changes', async () => {
    const user = userEvent.setup()
    const props = makeProps({ type: 'text' })
    render(<FieldEditor {...props} />)
    await user.selectOptions(screen.getByRole('combobox', { name: /field type/i }), 'email')
    expect(props.onChange).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'email' })
    )
  })

  it('calls onChange with split options when options input changes', () => {
    // The options input is controlled: each comma keystroke triggers split/rejoin,
    // which would strip the comma from the displayed value. Use fireEvent.change
    // to set the full comma-separated string in one shot.
    const { onChange } = renderStateful({ type: 'select', options: [] })
    const input = screen.getByRole('textbox', { name: /options/i })
    fireEvent.change(input, { target: { value: 'Yes, No, Maybe' } })
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({ options: ['Yes', 'No', 'Maybe'] })
    )
  })

  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup()
    const props = makeProps()
    render(<FieldEditor {...props} />)
    await user.click(screen.getByRole('button', { name: /delete field/i }))
    expect(props.onDelete).toHaveBeenCalledOnce()
  })

  it('switching from select to text clears options from the field', async () => {
    const user = userEvent.setup()
    const props = makeProps({ type: 'select', options: ['A', 'B'] })
    render(<FieldEditor {...props} />)
    await user.selectOptions(screen.getByRole('combobox', { name: /field type/i }), 'text')
    const lastCall = props.onChange.mock.calls.at(-1)?.[0] as FormField
    expect(lastCall.options).toBeUndefined()
  })

  it('shows "Add help text" button when helpText is not set', () => {
    render(<FieldEditor {...makeProps()} />)
    expect(screen.getByRole('button', { name: /add help text/i })).toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: /help text/i })).not.toBeInTheDocument()
  })

  it('shows help text input after clicking "Add help text"', async () => {
    const user = userEvent.setup()
    render(<FieldEditor {...makeProps()} />)
    await user.click(screen.getByRole('button', { name: /add help text/i }))
    expect(screen.getByRole('textbox', { name: /help text/i })).toBeInTheDocument()
  })

  it('shows help text input immediately when field already has helpText', () => {
    render(<FieldEditor {...makeProps({ helpText: 'Enter your full name' })} />)
    expect(screen.getByRole('textbox', { name: /help text/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /add help text/i })).not.toBeInTheDocument()
  })

  it('calls onChange when required checkbox is toggled', async () => {
    const user = userEvent.setup()
    const props = makeProps({ required: false })
    render(<FieldEditor {...props} />)
    await user.click(screen.getByRole('checkbox', { name: /required/i }))
    expect(props.onChange).toHaveBeenCalledWith(
      expect.objectContaining({ required: true })
    )
  })
})
