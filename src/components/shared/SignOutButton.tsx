'use client'

import { createClient } from '@/lib/supabase/client'

export default function SignOutButton() {
  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <button
      onClick={handleSignOut}
      className="text-sm text-ink-2 hover:text-ink hover:underline transition-colors"
    >
      Sign out
    </button>
  )
}
