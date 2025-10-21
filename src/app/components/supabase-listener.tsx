'use server'

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
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    )
                }
            }
        }
    )

    // セッションの取得
    const {
        data: { session },
    } = await supabase.auth.getSession()

    return <Navigation session={session} />
}

export default SupabaseListener