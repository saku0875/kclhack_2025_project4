import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const [total, unread, genres] = await Promise.all([
      supabase
        .from('bookmarks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id),
      supabase
        .from('bookmarks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false),
      supabase
        .from('genres')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id),
    ])

    return NextResponse.json({
      totalBookmarks: total.count ?? 0,
      unreadBookmarks: unread.count ?? 0,
      totalGenres: genres.count ?? 0,
    })
  } catch (error) {
    console.error('統計取得エラー:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
