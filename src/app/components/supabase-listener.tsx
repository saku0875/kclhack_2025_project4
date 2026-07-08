import { createClient } from '@/lib/supabase-server'
import Navigation from './navigation'

const SupabaseListener = async () => {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  let profile = null

  if (user) {
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    profile = currentProfile

    if (currentProfile && currentProfile.email !== user.email) {
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .update({ email: user.email })
        .match({ id: user.id })
        .select('*')
        .single()

      profile = updatedProfile
    }
  }

  return <Navigation user={user} profile={profile} />
}

export default SupabaseListener
