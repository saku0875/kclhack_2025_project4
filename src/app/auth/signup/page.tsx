import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { redirect } from 'next/navigation'
import Signup from '@/src/app/components/signup'
import type { Database } from '@/lib/database.types'

// サインアップページ
const SignupPage = async () => {
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

    // セッションの所得
    const {
        data: { session },
    } = await supabase.auth.getSession()

    // 認証している場合、リダイレクト
    if (session) {
        redirect('/')
    }

    return <Signup />
}

export default SignupPage