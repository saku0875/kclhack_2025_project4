import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: genreId } = await params
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: bookmarks, error: checkError } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('genre_id', genreId)
      .eq('user_id', user.id)

    if (checkError) {
      console.error('ブックマークチェックエラー:', checkError)
      return NextResponse.json({ message: 'エラーが発生しました' }, { status: 500 })
    }

    if (bookmarks && bookmarks.length > 0) {
      return NextResponse.json(
        { message: `このジャンルには${bookmarks.length}件のブックマークが紐づいているため削除できません` },
        { status: 400 }
      )
    }

    const { error: deleteError } = await supabase
      .from('genres')
      .delete()
      .eq('id', genreId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('ジャンル削除エラー:', deleteError)
      return NextResponse.json({ message: 'ジャンルの削除に失敗しました' }, { status: 500 })
    }

    return NextResponse.json({ message: 'ジャンルを削除しました' }, { status: 200 })
  } catch (error) {
    console.error('ジャンル削除エラー:', error)
    return NextResponse.json({ message: '予期しないエラーが発生しました' }, { status: 500 })
  }
}
