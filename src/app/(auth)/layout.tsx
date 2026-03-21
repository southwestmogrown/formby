import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <nav className="border-b border-border bg-white px-6 py-3 flex items-center justify-between">
        <Link href="/" className="text-lg font-bold text-brand hover:text-brand-dark transition-colors">
          Formby
        </Link>
        <Link href="/demo" className="text-sm text-ink-muted hover:text-ink transition-colors">
          Try demo
        </Link>
      </nav>
      {children}
    </div>
  )
}
