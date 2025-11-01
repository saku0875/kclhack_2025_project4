import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { redirect } from 'next/navigation'
import Logout from '@/src/app/components/logout'
import type { Database } from '@/lib/database.types'

// ログアウトページ
const LogoutPage = async () => {
    const cookieStore = await cookies()

    const supabase = createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
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

    return <Logout />
}

export default LogoutPage