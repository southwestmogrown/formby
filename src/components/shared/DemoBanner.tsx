import Link from 'next/link'
import { DEMO_LIMIT } from '@/lib/demo'

interface DemoBannerProps {
  generationsUsed: number
}

export default function DemoBanner({ generationsUsed }: DemoBannerProps) {
  const remaining = Math.max(0, DEMO_LIMIT - generationsUsed)

  return (
    <div className="border-b border-border bg-brand-light px-4 py-3">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">

        <div className="flex items-center gap-3 text-sm">
          {remaining === 0 ? (
            <span className="text-red-600 font-medium">No free generations left</span>
          ) : (
            <span className="text-ink-2">
              <span className="font-semibold text-brand">{remaining}</span> free {remaining === 1 ? 'generation' : 'generations'} remaining · demo mode
            </span>
          )}
        </div>

        <Link
          href="/signup"
          className="rounded-lg bg-brand px-3 py-1 text-xs font-semibold text-white hover:bg-brand-dark transition-colors"
        >
          Sign up free →
        </Link>
      </div>
    </div>
  )
}
