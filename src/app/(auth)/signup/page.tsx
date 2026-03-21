import SignupForm from '@/components/auth/SignupForm'

export const metadata = { title: 'Sign up — Formby' }

export default function SignupPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-surface">
      <SignupForm />
    </main>
  )
}
