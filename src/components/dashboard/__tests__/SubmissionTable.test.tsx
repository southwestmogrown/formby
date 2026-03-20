import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SubmissionTable from '../SubmissionTable'
import type { FormField, Submission } from '@/lib/types'

const fields: FormField[] = [
  { id: 'name', type: 'text', label: 'Name', required: true },
  { id: 'email', type: 'email', label: 'Email', required: false },
]

const submissions: Submission[] = [
  {
    id: 'sub-1',
    form_id: 'form-1',
    data: { name: 'Alice', email: 'alice@example.com' },
    created_at: '2024-01-15T10:30:00.000Z',
  },
  {
    id: 'sub-2',
    form_id: 'form-1',
    data: { name: 'Bob', email: 'bob@example.com' },
    created_at: '2024-01-16T11:00:00.000Z',
  },
]

describe('SubmissionTable', () => {
  it('renders column headers from field labels', () => {
    render(<SubmissionTable fields={fields} submissions={submissions} />)
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
  })

  it('renders a "Submitted" column header', () => {
    render(<SubmissionTable fields={fields} submissions={submissions} />)
    expect(screen.getByText(/Submitted/)).toBeInTheDocument()
  })

  it('renders one row per submission', () => {
    render(<SubmissionTable fields={fields} submissions={submissions} />)
    const rows = screen.getAllByRole('row')
    // 1 header row + 2 data rows
    expect(rows).toHaveLength(3)
  })

  it('renders field values in cells', () => {
    render(<SubmissionTable fields={fields} submissions={submissions} />)
    expect(screen.getByText('Alice')).toBeInTheDocument()
    expect(screen.getByText('alice@example.com')).toBeInTheDocument()
    expect(screen.getByText('Bob')).toBeInTheDocument()
    expect(screen.getByText('bob@example.com')).toBeInTheDocument()
  })

  it('joins array values with comma', () => {
    const arrayFields: FormField[] = [
      { id: 'name', type: 'text', label: 'Name', required: true },
    ]
    const arraySubmissions: Submission[] = [
      {
        id: 'sub-1',
        form_id: 'form-1',
        data: { name: ['a', 'b'] },
        created_at: '2024-01-15T10:30:00.000Z',
      },
    ]
    render(<SubmissionTable fields={arrayFields} submissions={arraySubmissions} />)
    expect(screen.getByText('a, b')).toBeInTheDocument()
  })

  it('renders boolean true as Yes', () => {
    const boolFields: FormField[] = [
      { id: 'agree', type: 'checkbox', label: 'Agree', required: false },
    ]
    const boolSubmissions: Submission[] = [
      {
        id: 'sub-1',
        form_id: 'form-1',
        data: { agree: true },
        created_at: '2024-01-15T10:30:00.000Z',
      },
    ]
    render(<SubmissionTable fields={boolFields} submissions={boolSubmissions} />)
    expect(screen.getByText('Yes')).toBeInTheDocument()
  })

  it('renders boolean false as No', () => {
    const boolFields: FormField[] = [
      { id: 'agree', type: 'checkbox', label: 'Agree', required: false },
    ]
    const boolSubmissions: Submission[] = [
      {
        id: 'sub-1',
        form_id: 'form-1',
        data: { agree: false },
        created_at: '2024-01-15T10:30:00.000Z',
      },
    ]
    render(<SubmissionTable fields={boolFields} submissions={boolSubmissions} />)
    expect(screen.getByText('No')).toBeInTheDocument()
  })

  it('shows empty state when no submissions', () => {
    render(<SubmissionTable fields={fields} submissions={[]} />)
    expect(screen.getByText('No submissions yet.')).toBeInTheDocument()
  })

  it('clicking Submitted header toggles sort order', async () => {
    const user = userEvent.setup()
    render(<SubmissionTable fields={fields} submissions={submissions} />)

    // Default is 'desc': Bob (Jan 16) should be first, Alice (Jan 15) second
    const rowsBefore = screen.getAllByRole('row')
    // rowsBefore[0] is header, rowsBefore[1] is first data row
    expect(rowsBefore[1]).toHaveTextContent('Bob')

    // Click to toggle to 'asc'
    await user.click(screen.getByText(/Submitted/))

    // Now Alice (Jan 15) should be first
    const rowsAfter = screen.getAllByRole('row')
    expect(rowsAfter[1]).toHaveTextContent('Alice')
  })
})
