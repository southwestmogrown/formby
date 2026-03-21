import { createClient } from '@/lib/supabase/server'
import NewFormPage from './NewFormPage'

export default async function Page() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return <NewFormPage userId={user!.id} />
}
