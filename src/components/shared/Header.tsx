import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import SignOutButton from './SignOutButton'

export default async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <header className="border-b border-border bg-white px-6 py-3 flex items-center justify-between">
      <Link href="/" className="text-lg font-bold text-brand hover:text-brand-dark transition-colors">
        Formby
      </Link>
      {user && (
        <div className="flex items-center gap-4">
          <span className="text-sm text-ink-muted">{user.email}</span>
          <SignOutButton />
        </div>
      )}
    </header>
  )
}
