import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { redirect } from 'next/navigation'
import ResetPassword from '@/src/app/components/reset-password'  // ✅ 修正
import type { Database } from '@/lib/database.types'

// パスワードリセットページ
const ResetPasswordPage = async () => {
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

    // 認証している場合、リダイレクト
    if (session) {
        redirect('/')
    }

    return <ResetPassword />
}

export default ResetPasswordPage