'use client'

import { useState } from 'react'
import type { FormField, FieldType } from '@/lib/types'

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: 'text', label: 'Short text' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'textarea', label: 'Long text' },
  { value: 'select', label: 'Dropdown' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'radio', label: 'Multiple choice' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
]

const TYPES_WITH_PLACEHOLDER: FieldType[] = ['text', 'email', 'phone', 'textarea', 'number']
const TYPES_WITH_OPTIONS: FieldType[] = ['select', 'radio', 'checkbox']

export interface FieldEditorProps {
  field: FormField
  onChange: (field: FormField) => void
  onDelete: () => void
}

export default function FieldEditor({ field, onChange, onDelete }: FieldEditorProps) {
  const showPlaceholder = TYPES_WITH_PLACEHOLDER.includes(field.type)
  const showOptions = TYPES_WITH_OPTIONS.includes(field.type)
  const [showHelpText, setShowHelpText] = useState(!!field.helpText)

  function update(patch: Partial<FormField>) {
    onChange({ ...field, ...patch })
  }

  function handleTypeChange(type: FieldType) {
    // Clear options when switching away from option-based types
    const newField: FormField = {
      ...field,
      type,
      options: TYPES_WITH_OPTIONS.includes(type) ? (field.options ?? []) : undefined,
    }
    onChange(newField)
  }

  function handleOptionsChange(value: string) {
    const options = value
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean)
    update({ options })
  }

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 flex flex-col gap-3">
      <div className="flex gap-3 items-start">
        {/* Type selector */}
        <div className="flex flex-col gap-1 w-40 shrink-0">
          <label className="text-xs font-medium text-zinc-500">Type</label>
          <select
            value={field.type}
            onChange={(e) => handleTypeChange(e.target.value as FieldType)}
            aria-label="Field type"
            className="rounded border border-zinc-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          >
            {FIELD_TYPES.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Label */}
        <div className="flex flex-col gap-1 flex-1">
          <label className="text-xs font-medium text-zinc-500">Label</label>
          <input
            type="text"
            value={field.label}
            onChange={(e) => update({ label: e.target.value })}
            placeholder="Field label"
            aria-label="Field label"
            className="rounded border border-zinc-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>

        {/* Required toggle */}
        <div className="flex flex-col gap-1 items-center shrink-0">
          <label className="text-xs font-medium text-zinc-500">Required</label>
          <input
            type="checkbox"
            checked={field.required}
            onChange={(e) => update({ required: e.target.checked })}
            aria-label="Required"
            className="h-4 w-4 rounded accent-zinc-900 mt-1.5"
          />
        </div>

        {/* Delete */}
        <button
          onClick={onDelete}
          aria-label="Delete field"
          className="shrink-0 mt-5 rounded p-1 text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Placeholder — only for compatible types */}
      {showPlaceholder && (
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-500">Placeholder</label>
          <input
            type="text"
            value={field.placeholder ?? ''}
            onChange={(e) => update({ placeholder: e.target.value || undefined })}
            placeholder="Placeholder text"
            aria-label="Placeholder text"
            className="rounded border border-zinc-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>
      )}

      {/* Options — only for select/radio/checkbox */}
      {showOptions && (
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-500">
            Options <span className="font-normal text-zinc-400">(comma-separated)</span>
          </label>
          <input
            type="text"
            value={field.options?.join(', ') ?? ''}
            onChange={(e) => handleOptionsChange(e.target.value)}
            placeholder="Option 1, Option 2, Option 3"
            aria-label="Options"
            className="rounded border border-zinc-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>
      )}

      {/* Help text — collapsible */}
      {showHelpText ? (
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-zinc-500">Help text</label>
            <button
              onClick={() => {
                setShowHelpText(false)
                update({ helpText: undefined })
              }}
              className="text-xs text-zinc-400 hover:text-zinc-600"
              aria-label="Remove help text"
            >
              Remove
            </button>
          </div>
          <input
            type="text"
            value={field.helpText ?? ''}
            onChange={(e) => update({ helpText: e.target.value || undefined })}
            placeholder="Shown below the field"
            aria-label="Help text"
            className="rounded border border-zinc-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900"
          />
        </div>
      ) : (
        <button
          onClick={() => setShowHelpText(true)}
          className="self-start text-xs text-zinc-400 hover:text-zinc-600 underline underline-offset-2"
          aria-label="Add help text"
        >
          + Add help text
        </button>
      )}
    </div>
  )
}
