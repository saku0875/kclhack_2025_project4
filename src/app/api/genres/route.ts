import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: genres, error } = await supabase
      .from('genres')
      .select('*, bookmarks(count)')
      .eq('user_id', user.id)
      .order('name', { ascending: true })

    if (error) {
      console.error('ジャンル取得エラー:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const genresWithCount = (genres || []).map((g: any) => ({
      ...g,
      _count: { bookmarks: g.bookmarks?.[0]?.count ?? 0 },
      bookmarks: undefined,
    }))

    return NextResponse.json(genresWithCount)
  } catch (error) {
    console.error('ジャンル取得エラー:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
    }

    const { name } = await request.json()

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'ジャンル名を入力してください' }, { status: 400 })
    }

    const { data: existingGenre } = await supabase
      .from('genres')
      .select('id')
      .eq('user_id', user.id)
      .eq('name', name.trim())
      .single()

    if (existingGenre) {
      return NextResponse.json({ error: '同じ名前のジャンルが既に存在します' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('genres')
      .insert({ name: name.trim(), user_id: user.id })
      .select()
      .single()

    if (error) {
      console.error('Supabaseエラー:', error)
      return NextResponse.json({ error: 'ジャンルの作成に失敗しました' }, { status: 500 })
    }

    return NextResponse.json({ ...data, _count: { bookmarks: 0 } }, { status: 201 })
  } catch (error) {
    console.error('APIエラー:', error)
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 })
  }
}
