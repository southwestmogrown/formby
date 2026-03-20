import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import FieldList from '../FieldList'
import type { FormField } from '@/lib/types'

function renderStateful(initial: FormField[]) {
  const onChange = vi.fn()

  function Wrapper() {
    const [fields, setFields] = useState<FormField[]>(initial)
    return (
      <FieldList
        fields={fields}
        onChange={(f) => { setFields(f); onChange(f) }}
      />
    )
  }

  render(<Wrapper />)
  return { onChange }
}

const sampleFields: FormField[] = [
  { id: 'field_1', type: 'text', label: 'Full Name', required: true },
  { id: 'field_2', type: 'email', label: 'Email Address', required: true },
]

beforeEach(() => {
  vi.clearAllMocks()
})

describe('FieldList', () => {
  it('renders a FieldEditor for each field', () => {
    render(<FieldList fields={sampleFields} onChange={vi.fn()} />)
    // Each FieldEditor renders a field label input; check both fields are present
    const labelInputs = screen.getAllByRole('textbox', { name: /field label/i })
    expect(labelInputs).toHaveLength(2)
    expect(labelInputs[0]).toHaveValue('Full Name')
    expect(labelInputs[1]).toHaveValue('Email Address')
  })

  it('renders empty list with no field editors when fields array is empty', () => {
    render(<FieldList fields={[]} onChange={vi.fn()} />)
    expect(screen.queryAllByRole('textbox', { name: /field label/i })).toHaveLength(0)
  })

  it('renders an "Add field" button', () => {
    render(<FieldList fields={[]} onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: /add field/i })).toBeInTheDocument()
  })

  it('clicking "Add field" calls onChange with a new blank text field appended', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<FieldList fields={sampleFields} onChange={onChange} />)
    await user.click(screen.getByRole('button', { name: /add field/i }))

    expect(onChange).toHaveBeenCalledOnce()
    const newFields: FormField[] = onChange.mock.calls[0][0]
    expect(newFields).toHaveLength(3)
    expect(newFields[2].type).toBe('text')
    expect(newFields[2].required).toBe(false)
    expect(newFields[2].label).toBe('')
    expect(newFields[2].id).toBeTruthy()
  })

  it('each newly added field has a unique id', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<FieldList fields={[]} onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: /add field/i }))
    // Small delay to ensure distinct timestamps
    await new Promise((r) => setTimeout(r, 2))
    await user.click(screen.getByRole('button', { name: /add field/i }))

    const firstFields: FormField[] = onChange.mock.calls[0][0]
    const secondFields: FormField[] = onChange.mock.calls[1][0]
    expect(firstFields[0].id).not.toBe(secondFields[1]?.id ?? secondFields[0].id)
  })

  it('deleting a field calls onChange with that field removed', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<FieldList fields={sampleFields} onChange={onChange} />)

    const deleteButtons = screen.getAllByRole('button', { name: /delete field/i })
    await user.click(deleteButtons[0])

    expect(onChange).toHaveBeenCalledWith([sampleFields[1]])
  })

  it('editing a field calls onChange with the updated field in place', async () => {
    const user = userEvent.setup()
    const { onChange } = renderStateful(sampleFields)

    const labelInputs = screen.getAllByRole('textbox', { name: /field label/i })
    await user.clear(labelInputs[0])
    await user.type(labelInputs[0], 'First Name')

    const lastCall: FormField[] = onChange.mock.calls.at(-1)?.[0]
    expect(lastCall[0].label).toBe('First Name')
    expect(lastCall[1]).toEqual(sampleFields[1]) // second field unchanged
  })

  it('renders drag handles for each field', () => {
    render(<FieldList fields={sampleFields} onChange={vi.fn()} />)
    const handles = screen.getAllByRole('button', { name: /drag to reorder/i })
    expect(handles).toHaveLength(2)
  })
})
