"use client";

import { useState, useEffect } from 'react'
import { ArrowLeft, Save, Link, Tag, FileText, Folder } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

interface Genre {
  id: string
  name: string
}

interface BookmarksnewProps {
  user: User
}

export default function Bookmarksnew({ user }: BookmarksnewProps) {
  const [loading, setLoading] = useState(true)
  const [genres, setGenres] = useState<Genre[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    description: '',
    genreId: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // ジャンル取得
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch('/api/genres')
        if (response.ok) {
          const genresData = await response.json()
          setGenres(genresData)
          // 最初のジャンルを自動選択
          if (genresData.length > 0) {
            setFormData(prev => ({ ...prev, genreId: genresData[0].id }))
          }
        }
      } catch (error) {
        console.error('ジャンル取得エラー:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchGenres()
  }, [])

  // ページ遷移関数
  const navigateTo = (path: string) => {
    window.location.href = path
  }

  // フォーム送信
  const handleSubmit = async () => {
    setSubmitting(true)
    setErrors({})

    // バリデーション
    if (!formData.url || !formData.title || !formData.genreId) {
      setErrors({ general: '必須項目を入力してください' })
      setSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        // 成功時
        alert('ブックマークが作成されました！')
        navigateTo('/auth/bookmarks')
      } else {
        if (data.error) {
          setErrors({ general: data.error })
        }
      }
    } catch (error) {
      console.error('ブックマーク作成エラー:', error)
      setErrors({ general: 'ブックマークの作成に失敗しました' })
    } finally {
      setSubmitting(false)
    }
  }

  const fetchUrlTitle = async () => {
    if (!formData.url) return

    try {
      const domain = new URL(formData.url).hostname.replace('www.', '')
      if (!formData.title) {
        setFormData(prev => ({ ...prev, title: domain }))
      }
    } catch (error) {
      // URL不正の場合は何もしない
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

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigateTo('/auth/bookmarks')}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft size={20} className="mr-2" />
                戻る
              </button>
              <h1 className="text-xl font-semibold text-gray-900">新しいブックマーク</h1>
            </div>
          </div>

          <div className="p-6">
            {/* エラー表示 */}
            {errors.general && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{errors.general}</p>
              </div>
            )}

            {/* ジャンルが空の場合の警告 */}
            {genres.length === 0 && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  ブックマークを作成する前に、まずジャンルを作成してください。
                </p>
                <button 
                  onClick={() => navigateTo('/auth/genres/new')}
                  className="mt-2 text-yellow-800 hover:text-yellow-900 underline text-sm"
                >
                  ジャンルを作成
                </button>
              </div>
            )}

            <div className="space-y-6">
              {/* URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Link size={16} className="inline mr-2" />
                  URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  value={formData.url}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  onBlur={fetchUrlTitle}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400 text-gray-900"
                  placeholder="https://example.com"
                />
              </div>

              {/* タイトル */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Tag size={16} className="inline mr-2" />
                  タイトル <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400 text-gray-900"
                  placeholder="ブックマークのタイトル"
                />
              </div>

              {/* ジャンル */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Folder size={16} className="inline mr-2" />
                  ジャンル <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.genreId}
                  onChange={(e) => setFormData(prev => ({ ...prev, genreId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  disabled={genres.length === 0}
                >
                  {genres.length === 0 ? (
                    <option value="">ジャンルがありません</option>
                  ) : (
                    <>
                      <option value="">ジャンルを選択</option>
                      {genres.map(genre => (
                        <option key={genre.id} value={genre.id}>{genre.name}</option>
                      ))}
                    </>
                  )}
                </select>
              </div>

              {/* 説明（オプション） */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText size={16} className="inline mr-2" />
                  説明（オプション）
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400 text-gray-900"
                  rows={3}
                  placeholder="このブックマークについての説明..."
                />
              </div>

              {/* 送信ボタン */}
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigateTo('/auth/bookmarks')}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={() => navigateTo('/auth/bookmarks')}
                  disabled={submitting || genres.length === 0}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>作成中...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>ブックマークを作成</span>
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
