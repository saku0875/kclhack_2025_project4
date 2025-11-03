import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/lib/database.types'

export async function GET(request: Request) {
    try {
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
                        } catch {}
                    }
                }
            }
        )

        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // クエリパラメータを取得
        const { searchParams } = new URL(request.url)
        const genreId = searchParams.get('genreId')
        const search = searchParams.get('search')
        const isRead = searchParams.get('isRead')

        // Supabase クエリを構築
        let query = (supabase as any)
            .from('bookmarks')
            .select(`
                *,
                genre:genres(*),
                shares:bookmark_shares(count)
            `)
            .eq('user_id', session.user.id)

        // フィルター適用
        if (genreId) {
            query = query.eq('genre_id', genreId)
        }

        if (search) {
            query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,url.ilike.%${search}%`)
        }

        if (isRead !== null) {
            query = query.eq('is_read', isRead === 'true')
        }

        // データ取得
        const { data: bookmarks, error } = await query.order('created_at', { ascending: false })

        if (error) {
            console.error('ブックマーク取得エラー:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // データ整形（React コンポーネントで期待される形式に）
        const formattedBookmarks = (bookmarks as any[] | undefined)?.map((bookmark: any) => ({
            id: bookmark.id,
            title: bookmark.title,
            url: bookmark.url,
            description: bookmark.description,
            isRead: bookmark.is_read,
            genre: bookmark.genre,
            _count: { 
                shares: Array.isArray(bookmark.shares) ? bookmark.shares.length : 0 
            },
            createdAt: bookmark.created_at
        }))

        return NextResponse.json(formattedBookmarks)
    } catch (error) {
        console.error('ブックマーク取得エラー:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}