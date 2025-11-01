'use client'

import { FormEvent, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from "next/navigation"
import Loading from '@/src/app/loading'
import type { Database } from '@/lib/database.types'

// ログアウト
const Logout = () => {
    const router = useRouter()
    const supabase = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    // 送信
    const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        try {
            // ログアウト
            const { error } = await supabase.auth.signOut()

            // エラーチェック
            if (error) {
                setMessage('エラーが発生しました。' + error.message)
                return
            }

        } catch (error) {
            setMessage('エラーが発生しました。' + error)
            return
        } finally {
            setLoading(false)
            router.refresh()
        }

    }

    return (
        <div>
            <div className="text-center mb-5">ログアウトしますか？</div>
            {/* ログアウトボタン */}
            <form onSubmit={onSubmit}>
                <div className="mb-5">
                    {loading ? (
                        <Loading />
                    ) : (
                        <button
                          type="submit"
                          className="font-bold bg-red-500 hover:brightness-95 w-full p-2"
                        >
                        ログアウト
                        </button>
                    )}
                </div>
            </form>

            {message && <div className="my-5 text-center text-sm text-red-500">{message}</div>}
        </div>
    )
}

export default Logout