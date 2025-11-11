'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, Save, Tag, Link, FileText } from 'lucide-react'

interface Genre {
  id: string
  name: string
}

interface Bookmark {
  id: string
  title: string
  url: string
  description?: string
  genreId: string
  genre: { name: string }
}

export default function EditBookmarkPage() {
  const searchParams = useSearchParams()
  const bookmarkId = searchParams.get('id')
    
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [genres, setGenres] = useState<Genre[]>([])
  const [bookmark, setBookmark] = useState<Bookmark | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    genreId: ''
  })
  const [error, setError] = useState('')

  const navigateTo = (path: string) => {
    window.location.href = path
  }

  useEffect(() => {
    if (!bookmarkId) {
      setError('ブックマークIDが指定されていません')
      setLoading(false)
      return
    }
    
    const fetchData = async () => {
      try {
        // ジャンル取得
        const genresResponse = await fetch('/api/genres')
        if (genresResponse.ok) {
          const genresData = await genresResponse.json()
          setGenres(genresData)
        }

        // 個別ブックマーク取得
        const bookmarkResponse = await fetch(`/api/bookmarks/${bookmarkId}`)
        
        if (bookmarkResponse.ok) {
          const bookmarkData = await bookmarkResponse.json()
          setBookmark(bookmarkData)
          setFormData({
            title: bookmarkData.title,
            url: bookmarkData.url,
            description: bookmarkData.description || '',
            genreId: bookmarkData.genreId
          })
        } else if (bookmarkResponse.status === 404) {
          setError('ブックマークが見つかりません')
        } else {
          setError('ブックマークの取得に失敗しました')
        }
      } catch (error) {
        console.error('データ取得エラー:', error)
        setError('データの取得に失敗しました')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [bookmarkId])

  const handleSubmit = async () => {
    if (!formData.title || !formData.url || !formData.genreId) {
      setError('必須項目を入力してください')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const response = await fetch(`/api/bookmarks/${bookmarkId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        alert('ブックマークを更新しました')
        navigateTo('/auth/bookmarks')
      } else {
        const data = await response.json()
        setError(data.error || '更新に失敗しました')
      }
    } catch (error) {
      setError('更新に失敗しました')
    } finally {
      setSubmitting(false)
    }
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

  if (!bookmark) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'ブックマークが見つかりません'}</p>
          <button 
            onClick={() => navigateTo('/auth/bookmarks')} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ブックマーク一覧に戻る
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button 
              onClick={() => navigateTo('/auth/bookmarks')}
              className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
            >
              <ArrowLeft size={20} className="mr-2" />
              戻る
            </button>
            <h1 className="text-2xl font-bold text-gray-900">ブックマーク編集</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Link size={16} className="inline mr-2" />
                  URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Tag size={16} className="inline mr-2" />
                  タイトル <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ジャンル <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.genreId}
                  onChange={(e) => setFormData(prev => ({ ...prev, genreId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {genres.map(genre => (
                    <option key={genre.id} value={genre.id}>{genre.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText size={16} className="inline mr-2" />
                  説明
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => navigateTo('/auth/bookmarks')}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 flex items-center space-x-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>更新中...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>更新</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}