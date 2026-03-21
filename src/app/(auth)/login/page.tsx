import LoginForm from '@/components/auth/LoginForm'

export const metadata = { title: 'Log in — AI Form Builder' }

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-surface">
      <LoginForm />
    </main>
  )
}
