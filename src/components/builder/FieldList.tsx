'use client'

import { useRef, useState } from 'react'
import type { FormField } from '@/lib/types'
import FieldEditor from './FieldEditor'

interface FieldListProps {
  fields: FormField[]
  onChange: (fields: FormField[]) => void
}

function newTextField(): FormField {
  return {
    id: `field_${Date.now()}`,
    type: 'text',
    label: '',
    required: false,
  }
}

export default function FieldList({ fields, onChange }: FieldListProps) {
  const dragIndexRef = useRef<number | null>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dropIndex, setDropIndex] = useState<number | null>(null)

  function handleFieldChange(index: number, updated: FormField) {
    const next = [...fields]
    next[index] = updated
    onChange(next)
  }

  function handleDelete(index: number) {
    onChange(fields.filter((_, i) => i !== index))
  }

  function handleAddField() {
    onChange([...fields, newTextField()])
  }

  // HTML5 Drag and Drop reorder
  // We only commit the reorder on `drop`, not on `dragover`.
  // This avoids the flicker/loop caused by firing onChange many times during a drag.
  function handleDragStart(index: number) {
    dragIndexRef.current = index
    setDragIndex(index)
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault() // required to allow drop
    setDropIndex(index)
  }

  function handleDrop(index: number) {
    const from = dragIndexRef.current
    if (from === null || from === index) return

    const next = [...fields]
    const [item] = next.splice(from, 1)
    next.splice(index, 0, item)
    onChange(next)
  }

  function handleDragEnd() {
    dragIndexRef.current = null
    setDragIndex(null)
    setDropIndex(null)
  }

  return (
    <div className="flex flex-col gap-3">
      {fields.map((field, index) => (
        <div
          key={field.id}
          onDragOver={(e) => handleDragOver(e, index)}
          onDrop={() => handleDrop(index)}
          className={`flex gap-2 items-start transition-opacity ${
            dropIndex === index && dragIndex !== index ? 'opacity-50' : ''
          }`}
        >
          {/* Drag handle — only this element is draggable, not the whole card */}
          <div
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragEnd={handleDragEnd}
            role="button"
            aria-label="Drag to reorder"
            className="mt-4 cursor-grab text-border hover:text-ink-muted shrink-0 select-none"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
              <path d="M7 2a2 2 0 110 4 2 2 0 010-4zm6 0a2 2 0 110 4 2 2 0 010-4zM7 8a2 2 0 110 4 2 2 0 010-4zm6 0a2 2 0 110 4 2 2 0 010-4zm-6 6a2 2 0 110 4 2 2 0 010-4zm6 0a2 2 0 110 4 2 2 0 010-4z" />
            </svg>
          </div>

          <div className="flex-1">
            <FieldEditor
              field={field}
              onChange={(updated) => handleFieldChange(index, updated)}
              onDelete={() => handleDelete(index)}
            />
          </div>
        </div>
      ))}

      <button
        onClick={handleAddField}
        className="flex items-center gap-2 rounded-lg border border-dashed border-border px-4 py-3 text-sm text-ink-muted hover:border-brand hover:text-brand transition-colors"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
            clipRule="evenodd"
          />
        </svg>
        Add field
      </button>
    </div>
  )
}
