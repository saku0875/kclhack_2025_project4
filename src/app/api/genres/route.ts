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
            .order('name', { ascending: true })

        if (error) {
            console.error('ジャンル取得エラー:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(genres)
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

        return NextResponse.json({ data }, { status: 201 })
        
    } catch (error) {
        console.error('APIエラー:', error)
        return NextResponse.json(
            { error: 'サーバーエラーが発生しました' },
            { status: 500 }
        )
    }
}