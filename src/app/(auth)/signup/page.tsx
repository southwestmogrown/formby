import SignupForm from '@/components/auth/SignupForm'

export const metadata = { title: 'Sign up — Formby' }

export default function SignupPage() {
  return (
    <main className="flex-1 flex items-center justify-center p-4">
      <SignupForm />
    </main>
  )
}
