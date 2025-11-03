import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
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

        // 認証チェック
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const genreId = params.id

        // このジャンルに紐づくブックマークがあるかチェック
        const { data: bookmarks, error: checkError } = await supabase
            .from('bookmarks')
            .select('id')
            .eq('genre_id', genreId)
            .eq('user_id', user.id)

        if (checkError) {
            console.error('ブックマークチェックエラー:', checkError)
            return NextResponse.json({ 
                message: 'エラーが発生しました' 
            }, { status: 500 })
        }

        // ブックマークが存在する場合は削除不可
        if (bookmarks && bookmarks.length > 0) {
            return NextResponse.json({ 
                message: `このジャンルには${bookmarks.length}件のブックマークが紐づいているため削除できません` 
            }, { status: 400 })
        }

        // ジャンルを削除
        const { error: deleteError } = await supabase
            .from('genres')
            .delete()
            .eq('id', genreId)
            .eq('user_id', user.id)

        if (deleteError) {
            console.error('ジャンル削除エラー:', deleteError)
            return NextResponse.json({ 
                message: 'ジャンルの削除に失敗しました' 
            }, { status: 500 })
        }

        return NextResponse.json({ 
            message: 'ジャンルを削除しました' 
        }, { status: 200 })

    } catch (error) {
        console.error('ジャンル削除エラー:', error)
        return NextResponse.json({ 
            message: '予期しないエラーが発生しました' 
        }, { status: 500 })
    }
}