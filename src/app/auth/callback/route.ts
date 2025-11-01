import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { Database } from '@/lib/database.types'

// サインアップ後のリダイレクト先
export async function GET(request: NextRequest) {
    // URL取得
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    if (code) {
        const cookieStore = await cookies()
        
        // Supabaseのクライアントインスタンスを作成
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
                    },
                },
            }
        )

        // 認証コードをセッショントークンに交換
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        
        if (!error) {
            // セッションをリフレッシュしてメールアドレス変更を反映
            await supabase.auth.refreshSession()
            
            // プロフィールページにリダイレクト（変更が反映されたことを確認しやすい）
            return NextResponse.redirect(new URL('/settings/profile', requestUrl.origin))
        } else {
            console.error('Session exchange error:', error)
        }
    }

    // ホームページにリダイレクト
    return NextResponse.redirect(requestUrl.origin)
}