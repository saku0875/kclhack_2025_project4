import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/lib/database.types'

export async function GET(request: Request) {
    try {
        const cookieStore = await cookies()
        
        const supabase = createServerClient<any>(
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

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // クエリパラメータを取得
        const { searchParams } = new URL(request.url)
        const genreId = searchParams.get('genreId')
        const search = searchParams.get('search')
        const isRead = searchParams.get('isRead')
        const limit = searchParams.get('limit')

        // ブックマークを取得（ジャンル情報なし）
        let query = supabase
            .from('bookmarks')
            .select('*')
            .eq('user_id', user.id)

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

        if (limit) {
            query = query.limit(parseInt(limit))
        }

        // データ取得
        const { data: bookmarks, error } = await query.order('created_at', { ascending: false })

        if (error) {
            console.error('ブックマーク取得エラー:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // ジャンル情報を別途取得
        const genreIds = [...new Set(bookmarks?.map(b => b.genre_id).filter(id => id))]
        
        let genreMap = new Map()
        
        if (genreIds.length > 0) {
            const { data: genresData } = await supabase
                .from('genres')
                .select('*')
                .in('id', genreIds)
            
            genreMap = new Map(genresData?.map(g => [g.id, g]))
        }

        // データ整形
        const formattedBookmarks = bookmarks?.map((bookmark: any) => ({
            id: bookmark.id,
            title: bookmark.title,
            url: bookmark.url,
            description: bookmark.description,
            isRead: bookmark.is_read,
            genre: genreMap.get(bookmark.genre_id) || { name: '不明' },
            _count: { 
                shares: 0
            },
            createdAt: bookmark.created_at
        }))

        return NextResponse.json(formattedBookmarks)
    } catch (error) {
        console.error('ブックマーク取得エラー:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies()
        
        const supabase = createServerClient<any>(
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

        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { title, url, description, genreId } = body

        if (!title || !url || !genreId) {
            return NextResponse.json(
                { error: '必須項目を入力してください' },
                { status: 400 }
            )
        }

        // ブックマークを作成
        const { data, error } = await supabase
            .from('bookmarks')
            .insert({
                title,
                url,
                description: description || null,
                genre_id: genreId,
                user_id: user.id,
                is_read: false
            })
            .select()
            .single()

        if (error) {
            console.error('ブックマーク作成エラー:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data, { status: 201 })
    } catch (error) {
        console.error('ブックマーク作成エラー:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}