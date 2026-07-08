import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const genreId = searchParams.get('genreId')
    const search = searchParams.get('search')
    const isRead = searchParams.get('isRead')
    const limit = searchParams.get('limit')

    let query = supabase
      .from('bookmarks')
      .select('*')
      .eq('user_id', user.id)

    if (genreId) {
      query = query.eq('genre_id', genreId)
    }

    if (search) {
      const sanitized = search.replace(/[,()%_\\]/g, '')
      if (sanitized) {
        query = query.or(
          `title.ilike.%${sanitized}%,description.ilike.%${sanitized}%,url.ilike.%${sanitized}%`
        )
      }
    }

    if (isRead !== null) {
      query = query.eq('is_read', isRead === 'true')
    }

    if (limit) {
      query = query.limit(parseInt(limit))
    }

    const { data: bookmarks, error } = await query.order('created_at', { ascending: false })

    if (error) {
      console.error('ブックマーク取得エラー:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const genreIds = [...new Set(bookmarks?.map(b => b.genre_id).filter((id): id is string => !!id))]

    let genreMap = new Map<string, { id: string; name: string }>()

    if (genreIds.length > 0) {
      const { data: genresData } = await supabase
        .from('genres')
        .select('*')
        .in('id', genreIds)

      genreMap = new Map(genresData?.map(g => [g.id, g]))
    }

    const formattedBookmarks = bookmarks?.map(bookmark => ({
      id: bookmark.id,
      title: bookmark.title,
      url: bookmark.url,
      description: bookmark.description,
      isRead: bookmark.is_read,
      genre: genreMap.get(bookmark.genre_id ?? '') || { name: '不明' },
      _count: { shares: 0 },
      createdAt: bookmark.created_at,
    }))

    return NextResponse.json(formattedBookmarks)
  } catch (error) {
    console.error('ブックマーク取得エラー:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, url, description, genreId } = body

    if (!title || !url || !genreId) {
      return NextResponse.json({ error: '必須項目を入力してください' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('bookmarks')
      .insert({
        title,
        url,
        description: description || null,
        genre_id: genreId,
        user_id: user.id,
        is_read: false,
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
