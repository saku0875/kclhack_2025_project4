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
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            )
                        } catch {
                            // Server Component内でのcookie設定エラーを無視
                        }
                    },
                },
            }
        )

        // 認証コードをセッショントークンに交換
        await supabase.auth.exchangeCodeForSession(code)
    }

    // ホームページにリダイレクト
    return NextResponse.redirect(requestUrl.origin)
}
