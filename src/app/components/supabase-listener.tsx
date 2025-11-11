import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Navigation from './navigation'
import { Database } from '@/lib/database.types'

// 認証機能の監視
const SupabaseListener = async () => {
    const cookieStore = await cookies()

    const supabase = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                    }
                }
            }
        }
    )

    // セッションの取得
    const {
        data: { session },
    } = await supabase.auth.getSession()

    // プロフィールの取得
    let profile = null

    if (session) {
        const { data: currentProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

        profile = currentProfile

        // メールアドレスを変更した場合、プロフィールを更新
        if (currentProfile && currentProfile.email !== session.user.email) {
            // メールアドレスを更新
            const { data: updateProfile } = await supabase
                .from('profiles')
                .update({ email: session.user.email })
                .match({ id: session.user.id })
                .select('*')
                .single()

            profile = updateProfile
        }
    }

    return <Navigation session={session} profile={profile} />
}

export default SupabaseListener