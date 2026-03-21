'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setError(error.message)
      setIsLoading(false)
      return
    }

    window.location.href = '/forms'
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
      <h1 className="text-xl font-semibold text-ink">Create your account</h1>

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium text-ink-2">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="border border-border focus:outline-none focus:ring-2 focus:ring-brand rounded-lg px-3 py-2 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium text-ink-2">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          minLength={6}
          className="border border-border focus:outline-none focus:ring-2 focus:ring-brand rounded-lg px-3 py-2 text-sm"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="bg-brand hover:bg-brand-dark text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50 transition-colors"
      >
        {isLoading ? 'Creating account…' : 'Sign up'}
      </button>

      <p className="text-sm text-center text-ink-muted">
        Already have an account?{' '}
        <Link href="/login" className="text-brand hover:text-brand-dark">Log in</Link>
      </p>
    </form>
  )
}
