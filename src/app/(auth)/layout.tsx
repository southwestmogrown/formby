import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ink/90 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* Modal header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-border">
          <Link href="/" className="text-lg font-bold text-brand hover:text-brand-dark transition-colors">
            Formby
          </Link>
          <Link
            href="/"
            aria-label="Close"
            className="text-2xl leading-none text-ink-muted hover:text-ink transition-colors"
          >
            ×
          </Link>
        </div>

        {/* Form content */}
        <div className="px-8 py-8">
          {children}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 bg-surface border-t border-border text-center">
          <Link href="/demo" className="text-xs text-ink-muted hover:text-brand transition-colors">
            Just want to try it? Use the demo →
          </Link>
        </div>

      </div>
    </div>
  )
}
