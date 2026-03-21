import LoginForm from '@/components/auth/LoginForm'

export const metadata = { title: 'Log in — Formby' }

export default function LoginPage() {
  return (
    <main className="flex-1 flex items-center justify-center p-4">
      <LoginForm />
    </main>
  )
}
