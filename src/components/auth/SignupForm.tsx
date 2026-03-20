'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/`,
      },
    })

    if (error) {
      setError(error.message)
      setIsLoading(false)
      return
    }

    setConfirmed(true)
    setIsLoading(false)
  }

  if (confirmed) {
    return (
      <div className="flex flex-col gap-4 w-full max-w-sm text-center">
        <h1 className="text-2xl font-semibold">Check your email</h1>
        <p className="text-gray-600 text-sm">
          We sent a confirmation link to <strong>{email}</strong>.
          Click the link to activate your account.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
      <h1 className="text-2xl font-semibold">Create an account</h1>

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="border rounded px-3 py-2 text-sm"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          minLength={6}
          className="border rounded px-3 py-2 text-sm"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600">{error}</p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="bg-black text-white rounded px-4 py-2 text-sm font-medium disabled:opacity-50"
      >
        {isLoading ? 'Creating account…' : 'Sign up'}
      </button>

      <p className="text-sm text-center text-gray-500">
        Already have an account?{' '}
        <Link href="/login" className="underline">Log in</Link>
      </p>
    </form>
  )
}
