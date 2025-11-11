import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { redirect } from 'next/navigation'
import Bookmarksnew from '@/src/app/components/bookmarksnew'
import type { Database } from '@/lib/database.types'

const BookmarksnewPage = async () => {
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

    // 認証していない場合、リダイレクト
    if (!session) {
        redirect('/')
    }

    return <Bookmarksnew user={session.user} />
}

export default BookmarksnewPage