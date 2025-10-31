import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { redirect } from 'next/navigation'
import Profile from '@/src/app/components/profile'

import type { Database } from '@/lib/database.types'

const ProfilePage = async () => {
    const cookieStore = cookies()

    const supabase = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                async get(name: string) {
                    return (await cookieStore).get(name)?.value
                },
            },
        }
    )

    // セッションの取得
    const {
        data: { session },
    } = await supabase.auth.getSession()

    // 認証していない場合、リダイレクト
    if (!session) {
        redirect('/auth/login')
    }

    return <Profile />
}

export default ProfilePage