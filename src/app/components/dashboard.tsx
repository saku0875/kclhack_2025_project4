'use client'

import {useState, useEffect } from "react"
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { BookOpen, FolderOpen, Share2, Trash2 } from 'lucide-react'

interface Genre {
  id: string
  name: string
  _count: { bookmarks: number }
  createdAt: string
}

interface Bookmark {
  id: string
  title: string
  url: string
  isRead: boolean
  genre: { name: string }
  _count: { shares: number }
  createdAt: string
}

export default function Dashboard() {
  const router = useRouter()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [genres, setGenres] = useState<Genre[]>([])
  const [recentBookmarks, setRecentBookmarks] = useState<Bookmark[]>([])

  // 認証チェック
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push('/')
        return
      }
      
      setUser(session.user)
      setLoading(false)
    }
    
    checkAuth()

    // リアルタイムで認証状態を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/')
      } else if (session) {
        setUser(session.user)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

// データ取得
useEffect(() => {
  const fetchData = async () => {
    if (!user) return

    try {
      // ジャンル取得
      console.log('Fetching genres...')
      const genresResponse = await fetch('/api/genres')
      console.log('Genres response status:', genresResponse.status)
      
      if (!genresResponse.ok) {
        const text = await genresResponse.text()
        console.error('Genres error response:', text)
      } else {
        const genresData = await genresResponse.json()
        console.log('Genres data:', genresData)
        setGenres(genresData)
      }

      // ブックマーク取得
      console.log('Fetching bookmarks...')
      const bookmarksResponse = await fetch('/api/bookmarks?limit=5')
      console.log('Bookmarks response status:', bookmarksResponse.status)
      
      if (!bookmarksResponse.ok) {
        const text = await bookmarksResponse.text()
        console.error('Bookmarks error response:', text)
      } else {
        const bookmarksData = await bookmarksResponse.json()
        console.log('Bookmarks data:', bookmarksData)
        setRecentBookmarks(bookmarksData)
      }
    } catch (error) {
      console.error('データ取得エラー:', error)
    }
  }

  fetchData()
}, [user])

  const handleDeleteGenre = async (id: string) => {
    if (!window.confirm('このジャンルを本当に削除しますか？\n（関連するブックマークがない場合のみ削除できます）')) {
      return
    }

    try {
      const response = await fetch(`/api/genres/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setGenres(genres.filter(genre => genre.id !== id))
      } else {
        const errorData = await response.json()
        alert(errorData.message || 'ジャンルの削除に失敗しました。')
      }
    } catch (error) {
      console.error('ジャンルの削除中にエラーが発生しました:', error)
      alert('エラーが発生しました。')
    }
  }

    const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const navigateTo = (path: string) => {
    router.push(path)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
            ))}
          </div>
        </main>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const stats = {
    totalBookmarks: genres.reduce((sum, genre) => {
      return sum + (genre._count?.bookmarks || 0);}, 0),
    totalGenres: genres.length,
    unreadBookmarks: recentBookmarks.filter(bookmark => !bookmark.isRead).length
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* 総ブックマーク */}
          <div className="bg-gradient-to-br from-blue-200 to-blue-500 rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-90">総ブックマーク</p>
                <p className="text-3xl font-bold mt-2">{stats.totalBookmarks}</p>
              </div>
              <BookOpen className="h-12 w-12 opacity-80" />
            </div>
          </div>

          {/* ジャンル数 */}
          <div className="bg-gradient-to-br from-cyan-200 to-cyan-500 rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-90">ジャンル数</p>
                <p className="text-3xl font-bold mt-2">{stats.totalGenres}</p>
              </div>
              <FolderOpen className="h-12 w-12 opacity-80" />
            </div>
          </div>

          {/* 未読 */}
          <div className="bg-gradient-to-br from-sky-200 to-sky-500 rounded-lg shadow-lg p-6 text-white transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium opacity-90">未読</p>
                <p className="text-3xl font-bold mt-2">{stats.unreadBookmarks}</p>
              </div>
              <Share2 className="h-12 w-12 opacity-80" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ジャンル一覧 */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900">ジャンル</h2>
                <button 
                  onClick={() => navigateTo('/auth/genres/new')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  + 新規作成
                </button>
              </div>
            </div>
            <div className="p-6 max-h-[400px] overflow-y-auto">
            {genres.length === 0 ? (
              <div className="text-center py-8">
                <FolderOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
               <p className="text-gray-500">ジャンルがありません</p>
                <button 
                  onClick={() => navigateTo('/auth/genres/new')}
                  className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  最初のジャンルを作成
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {genres.map((genre) => (
                  <div 
                    key={genre.id} 
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 group"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-gray-800">{genre.name}</span>
                      <span className="text-sm text-gray-500 bg-gray-200 px-2 py-1 rounded-full">
                        {genre._count?.bookmarks || 0}件
                      </span>
                    </div>
                    <button 
                      onClick={() => handleDeleteGenre(genre.id)}
                      className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
          
          {/* 最近のブックマーク */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">最近のブックマーク</h2>
                   <button 
                      onClick={() => navigateTo('/auth/bookmarks/new')}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      + 新規作成
                    </button>
                </div>
            </div>
            <div className="p-6 max-h-[400px] overflow-y-auto">
              {recentBookmarks.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">ブックマークがありません</p>
                  <button 
                    onClick={() => navigateTo('/auth/bookmarks/new')}
                    className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    最初のブックマークを追加
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentBookmarks.map((bookmark) => (
                    <div 
                      key={bookmark.id}
                      className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900 truncate">{bookmark.title}</h3>
                          {!bookmark.isRead && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              未読
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate">{bookmark.url}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-gray-500">{bookmark.genre.name}</span>
                          {bookmark._count.shares > 0 && (
                            <span className="text-xs text-gray-500">
                              {bookmark._count.shares}人と共有中
                            </span>
                          )}
                        </div>
                      </div>
                      <button 
                        onClick={() => window.open(bookmark.url, '_blank')}
                        className="ml-4 text-blue-600 hover:text-blue-700 text-sm flex-shrink-0"
                      >
                        開く
                      </button>
                    </div>
                  ))}
                  <div className="text-center pt-4">
                    <button 
                      onClick={() => navigateTo('/auth/bookmarks')}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      すべて表示
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}