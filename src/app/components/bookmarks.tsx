"use client";

import { useState, useEffect } from 'react'
import { Search, Filter, Plus, ExternalLink, Edit, Trash2, Eye, EyeOff } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

interface Genre {
  id: string
  name: string
}

interface Bookmark {
  id: string
  title: string
  url: string
  description?: string
  isRead: boolean
  genre: Genre
  _count: { shares: number }
  createdAt: string
}

interface BookmarksProps {
  user?: User
}

export default function Bookmarks({user}: BookmarksProps) {
  const [loading, setLoading] = useState(true)
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [genres, setGenres] = useState<Genre[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('')
  const [showFilter, setShowFilter] = useState(false)
  const [readFilter, setReadFilter] = useState<'all' | 'read' | 'unread'>('all')

  // データ取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        // ジャンル一覧取得
        const genresResponse = await fetch('/api/genres')
        if (genresResponse.ok) {
          const genresData = await genresResponse.json()
          setGenres(genresData)
        }

        // ブックマーク取得
        const params = new URLSearchParams()
        if (selectedGenre) params.append('genreId', selectedGenre)
        if (searchTerm) params.append('search', searchTerm)
        if (readFilter !== 'all') params.append('isRead', readFilter === 'read' ? 'true' : 'false')
        
        const bookmarksResponse = await fetch(`/api/bookmarks?${params.toString()}`)
        if (bookmarksResponse.ok) {
          const bookmarksData = await bookmarksResponse.json()
          setBookmarks(bookmarksData)
        }
      } catch (error) {
        console.error('データ取得エラー:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedGenre, searchTerm, readFilter])

  // 既読状態の切り替え
  const toggleReadStatus = async (bookmarkId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/bookmarks/${bookmarkId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: !currentStatus })
      })
      
      if (response.ok) {
        setBookmarks(prev => prev.map(bookmark => 
          bookmark.id === bookmarkId 
            ? { ...bookmark, isRead: !currentStatus }
            : bookmark
        ))
      }
    } catch (error) {
      console.error('既読状態更新エラー:', error)
    }
  }

  // ブックマーク削除
  const deleteBookmark = async (bookmarkId: string) => {
    if (!confirm('このブックマークを削除しますか？')) return
    
    try {
      const response = await fetch(`/api/bookmarks/${bookmarkId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        setBookmarks(prev => prev.filter(bookmark => bookmark.id !== bookmarkId))
      }
    } catch (error) {
      console.error('削除エラー:', error)
    }
  }

  // ページ遷移関数
  const navigateTo = (path: string) => {
    window.location.href = path
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* メインコンテンツ */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          {/* カードヘッダー：ダッシュボードボタン + 検索 + フィルター */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              {/* ダッシュボードボタン */}
              <button 
                onClick={() => navigateTo('/auth/dashboard')}
                className="text-gray-600 hover:text-gray-900 whitespace-nowrap"
              >
                ← 戻る
              </button>
              
              {/* 検索バー */}
              <div className="flex-1 relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="ブックマークを検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* フィルターボタン */}
              <button
                onClick={() => setShowFilter(!showFilter)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2 whitespace-nowrap"
              >
                <Filter size={20} />
                <span>フィルター</span>
              </button>
            </div>

            {/* フィルターオプション */}
            {showFilter && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* ジャンルフィルター */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ジャンル</label>
                    <select
                      value={selectedGenre}
                      onChange={(e) => setSelectedGenre(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">すべて</option>
                      {genres.map(genre => (
                        <option key={genre.id} value={genre.id}>{genre.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* 既読フィルター */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">既読状態</label>
                    <select
                      value={readFilter}
                      onChange={(e) => setReadFilter(e.target.value as 'all' | 'read' | 'unread')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">すべて</option>
                      <option value="unread">未読のみ</option>
                      <option value="read">既読のみ</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* カードコンテンツ：ブックマーク一覧 */}
          <div className="p-6">
            {bookmarks.length === 0 ? (
              // 空の状態
              <div className="text-center py-12">
                <div className="text-gray-300 mb-4">
                  <ExternalLink size={64} className="mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">ブックマークがありません</h3>
                <p className="text-gray-600 mb-6">最初のブックマークを追加してみましょう</p>
                <button 
                  onClick={() => navigateTo('/bookmarks/new')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
                >
                  ブックマークを追加
                </button>
              </div>
            ) : (
              // ブックマーク一覧
              <div className="space-y-3">
                {bookmarks.map((bookmark) => (
                  <div 
                    key={bookmark.id} 
                    className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {bookmark.title}
                        </h3>
                        {!bookmark.isRead && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            未読
                          </span>
                        )}
                        {bookmark._count.shares > 0 && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                            {bookmark._count.shares}人と共有
                          </span>
                        )}
                      </div>
                      
                      <a 
                        href={bookmark.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm truncate block mb-2"
                      >
                        {bookmark.url}
                      </a>
                      
                      {bookmark.description && (
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                          {bookmark.description}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>ジャンル: {bookmark.genre.name}</span>
                        <span>{new Date(bookmark.createdAt).toLocaleDateString('ja-JP')}</span>
                      </div>
                    </div>

                    {/* アクションボタン */}
                    <div className="flex items-center space-x-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => toggleReadStatus(bookmark.id, bookmark.isRead)}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-white"
                        title={bookmark.isRead ? '未読にする' : '既読にする'}
                      >
                        {bookmark.isRead ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                      
                      <a
                        href={bookmark.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-white"
                        title="リンクを開く"
                      >
                        <ExternalLink size={20} />
                      </a>
                      
                      <button
                        onClick={() => navigateTo(`/bookmarks/${bookmark.id}/edit`)}
                        className="p-2 text-gray-400 hover:text-yellow-600 rounded-lg hover:bg-white"
                        title="編集"
                      >
                        <Edit size={20} />
                      </button>
                      
                      <button
                        onClick={() => deleteBookmark(bookmark.id)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-white"
                        title="削除"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}