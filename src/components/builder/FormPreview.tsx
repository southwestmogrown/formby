import type { FormField } from '@/lib/types'

interface FormPreviewProps {
  fields: FormField[]
  name: string
}

function FieldPreview({ field }: { field: FormField }) {
  const labelEl = (
    <label className="block text-sm font-medium text-ink-2 mb-1">
      {field.label}
      {field.required && (
        <span className="ml-1 text-red-500" aria-label="required">
          *
        </span>
      )}
    </label>
  )

  const helpEl = field.helpText ? (
    <p className="mt-1 text-xs text-ink-muted">{field.helpText}</p>
  ) : null

  const inputClass =
    'block w-full rounded border border-border px-3 py-2 text-sm text-ink bg-surface focus:outline-none'

  let control: React.ReactNode

  switch (field.type) {
    case 'textarea':
      control = (
        <textarea
          readOnly
          placeholder={field.placeholder}
          rows={3}
          className={inputClass + ' resize-none'}
        />
      )
      break

    case 'select':
      if (!field.options || field.options.length === 0) {
        control = (
          <p className="text-xs text-ink-muted italic">No options defined yet.</p>
        )
      } else {
        control = (
          <select disabled className={inputClass}>
            <option value="">Select an option</option>
            {field.options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        )
      }
      break

    case 'radio':
      if (!field.options || field.options.length === 0) {
        control = (
          <p className="text-xs text-ink-muted italic">No options defined yet.</p>
        )
      } else {
        control = (
          <div className="flex flex-col gap-1">
            {field.options.map((opt) => (
              <label key={opt} className="flex items-center gap-2 text-sm text-ink-2">
                <input type="radio" readOnly name={field.id} value={opt} className="accent-brand" />
                {opt}
              </label>
            ))}
          </div>
        )
      }
      break

    case 'checkbox':
      if (field.options && field.options.length > 0) {
        // Checkbox group
        control = (
          <div className="flex flex-col gap-1">
            {field.options.map((opt) => (
              <label key={opt} className="flex items-center gap-2 text-sm text-ink-2">
                <input type="checkbox" readOnly className="h-4 w-4 accent-brand" />
                {opt}
              </label>
            ))}
          </div>
        )
      } else {
        // Single checkbox — renders its own label so we skip the outer labelEl
        control = (
          <label className="flex items-center gap-2 text-sm text-ink-2">
            <input type="checkbox" readOnly className="h-4 w-4 accent-brand" />
            {field.label}
            {field.required && (
              <span className="text-red-500" aria-label="required">*</span>
            )}
          </label>
        )
      }
      break

    case 'date':
      control = <input type="date" readOnly className={inputClass} />
      break

    case 'number':
      control = (
        <input
          type="number"
          readOnly
          placeholder={field.placeholder}
          className={inputClass}
        />
      )
      break

    case 'email':
      control = (
        <input
          type="email"
          readOnly
          placeholder={field.placeholder}
          className={inputClass}
        />
      )
      break

    case 'phone':
      control = (
        <input
          type="tel"
          readOnly
          placeholder={field.placeholder}
          className={inputClass}
        />
      )
      break

    case 'text':
    default:
      control = (
        <input
          type="text"
          readOnly
          placeholder={field.placeholder}
          className={inputClass}
        />
      )
      break
  }

  return (
    <div className="flex flex-col">
      {/* Single checkbox renders its own inline label; checkbox groups and all other types use the standard label */}
      {!(field.type === 'checkbox' && (!field.options || field.options.length === 0)) && labelEl}
      {control}
      {helpEl}
    </div>
  )
}

export default function FormPreview({ fields, name }: FormPreviewProps) {
  return (
    <div className="rounded-lg border border-border bg-white p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-semibold text-ink">{name || 'Untitled Form'}</h2>
        <span className="text-xs text-brand bg-brand-light rounded px-2 py-0.5">Preview only</span>
      </div>

      {fields.length === 0 ? (
        <p className="text-sm text-ink-muted text-center py-8">
          No fields yet. Generate or add a field to see the preview.
        </p>
      ) : (
        <div className="flex flex-col gap-5">
          {fields.map((field) => (
            <FieldPreview key={field.id} field={field} />
          ))}
        </div>
      )}
    </div>
  )
}
