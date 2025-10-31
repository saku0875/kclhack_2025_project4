import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { redirect } from 'next/navigation'
import Email from '@/src/app/components/email'
import type { Database } from '@/lib/database.types'

// メールアドレス変更ページ
const EmailPage = async () => {
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

    // 未認証の場合、リダイレクト
    if (!session) {
        redirect('/auth/login')
    }

    return <Email email={session.user.email!} />
}

export default EmailPage