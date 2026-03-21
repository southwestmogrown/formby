import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import SignOutButton from './SignOutButton'

export default async function Header() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <header className="border-b border-zinc-200 bg-white px-6 py-3 flex items-center justify-between">
      <Link href="/" className="text-sm font-bold text-zinc-900">
        Formby
      </Link>
      {user && (
        <div className="flex items-center gap-4">
          <span className="text-sm text-zinc-500">{user.email}</span>
          <SignOutButton />
        </div>
      )}
    </header>
  )
}
