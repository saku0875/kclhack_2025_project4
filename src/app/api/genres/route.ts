import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/lib/database.types'

export async function GET() {
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

        // Supabase でジャンル一覧を取得
        const { data: genres, error } = await supabase
            .from('genres' as any)
            .select('*')
            .eq('user_id', session.user.id)
            .order('name', { ascending: true })

        if (error) {
            console.error('ジャンル取得エラー:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        // 各ジャンルのブックマーク数をカウント
        const genresWithCount = await Promise.all(
            (genres || []).map(async (genre: any) => {
                const { count, error: countError } = await supabase
                    .from('bookmarks' as any)
                    .select('*', { count: 'exact', head: true })
                    .eq('genre_id', genre.id)
                    .eq('user_id', session.user.id)

                if (countError) {
                    console.error('カウント取得エラー:', countError)
                }

                return {
                    ...genre,
                    _count: {
                        bookmarks: count || 0
                    }
                }
            })
        )

        return NextResponse.json(genresWithCount)
    } catch (error) {
        console.error('ジャンル取得エラー:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

// POST メソッド
export async function POST(request: Request) {
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
            return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
        }

        // リクエストボディを取得
        const { name } = await request.json()

        if (!name || !name.trim()) {
            return NextResponse.json(
                { error: 'ジャンル名を入力してください' },
                { status: 400 }
            )
        }

        // 同じ名前のジャンルが既に存在するかチェック
        const { data: existingGenre } = await supabase
            .from('genres' as any)
            .select('id')
            .eq('user_id', session.user.id)
            .eq('name', name.trim())
            .single()

        if (existingGenre) {
            return NextResponse.json(
                { error: '同じ名前のジャンルが既に存在します' },
                { status: 400 }
            )
        }

        // Supabaseにジャンルを作成
        const { data, error } = await supabase
            .from('genres' as any)
            .insert({
                name: name.trim(),
                user_id: session.user.id,
            })
            .select()
            .single()

        if (error) {
            console.error('Supabaseエラー:', error)
            return NextResponse.json(
                { error: 'ジャンルの作成に失敗しました' },
                { status: 500 }
            )
        }

        // 作成したジャンルに _count を追加して返す
        const genreWithCount = {
            ...(data as any),
            _count: {
                bookmarks: 0  // 新規作成なので0
            }
        }

        return NextResponse.json(genreWithCount, { status: 201 })
        
    } catch (error) {
        console.error('APIエラー:', error)
        return NextResponse.json(
            { error: 'サーバーエラーが発生しました' },
            { status: 500 }
        )
    }
}