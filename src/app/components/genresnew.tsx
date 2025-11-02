'use client';

import { useState } from 'react'
import { ArrowLeft, Save, Tag } from 'lucide-react'

export default function NewGenrePage() {
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const navigateTo = (path: string) => {
    window.location.href = path
  }

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('ジャンル名を入力してください')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/genres', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: name.trim() }),
      })

      const data = await response.json()

      if (response.ok) {
        alert('ジャンルが作成されました！')
        navigateTo('/dashboard')
      } else {
        setError(data.error || 'ジャンルの作成に失敗しました')
      }
    } catch (error) {
      console.error('ジャンル作成エラー:', error)
      setError('ジャンルの作成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* メインコンテンツ */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          {/* カードヘッダー：戻るボタンとタイトル */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigateTo('/auth/dashboard')}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft size={20} className="mr-2" />
                戻る
              </button>
              <h1 className="text-xl font-semibold text-gray-900">新しいジャンル</h1>
            </div>
          </div>

          {/* カードコンテンツ：フォーム */}
          <div className="p-6">
            {/* エラー表示 */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-6">
              {/* ジャンル名 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Tag size={16} className="inline mr-2" />
                  ジャンル名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-400 text-gray-900"
                  placeholder="例：技術記事、レシピ、趣味..."
                  maxLength={50}
                />
                <p className="mt-1 text-sm text-gray-500">
                  {name.length}/50文字
                </p>
              </div>

              {/* 送信ボタン */}
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => navigateTo('/dashboard')}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || !name.trim()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>作成中...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>ジャンルを作成</span>
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
