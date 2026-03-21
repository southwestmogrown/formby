import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Header from '@/components/shared/Header'
import ApiKeyBanner from '@/components/shared/ApiKeyBanner'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <ApiKeyBanner userId={user.id} />
      <main className="flex flex-col flex-1">{children}</main>
    </div>
  )
}
