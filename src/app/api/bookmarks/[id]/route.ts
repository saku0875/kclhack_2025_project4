import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/lib/database.types'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        
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

        const { data, error } = await supabase
            .from('bookmarks')
            .select(`
                *,
                genre:genres(name)
            `)
            .eq('id', id)
            .eq('user_id', user.id)
            .single()

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json({ error: 'ブックマークが見つかりません' }, { status: 404 })
            }
            console.error('ブックマーク取得エラー:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        const response = {
            id: data.id,
            title: data.title,
            url: data.url,
            description: data.description,
            genreId: data.genre_id,
            isRead: data.is_read,
            genre: data.genre
        }

        return NextResponse.json(response)
    } catch (error) {
        console.error('ブックマーク取得エラー:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        
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

        const updateData: any = {}
        if ('isRead' in body) updateData.is_read = body.isRead
        if ('title' in body) updateData.title = body.title
        if ('url' in body) updateData.url = body.url
        if ('description' in body) updateData.description = body.description
        if ('genreId' in body) updateData.genre_id = body.genreId

        const { data, error } = await supabase
            .from('bookmarks')
            .update(updateData)
            .eq('id', id)
            .eq('user_id', user.id)
            .select()

        if (error) {
            console.error('ブックマーク更新エラー:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('ブックマーク更新エラー:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        
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

        const { error } = await supabase
            .from('bookmarks')
            .delete()
            .eq('id', id)
            .eq('user_id', user.id)

        if (error) {
            console.error('ブックマーク削除エラー:', error)
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('ブックマーク削除エラー:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}