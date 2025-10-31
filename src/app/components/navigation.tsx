'use client'

import Link from 'next/link'
import useStore from '@/store'
import Image from 'next/image'
import { Profiler, useEffect } from 'react'
import type { Session } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/database.types'
type ProfileType = Database['public']['Tables']['profiles']['Row']

// ナビゲーション
const Navigation = ({ 
    session, 
    profile,
}: { 
    session: Session | null
    profile: ProfileType | null
    }) => {
    const { setUser } = useStore()

    // 状態管理にユーザ情報を保存
    useEffect(() => {
        setUser({
            id: session ? session.user.id : '',
            email: session ? session.user.email! : '',
            name: session && profile ? profile.name : '',
            introduce: session && profile ? profile.introduce : '',
            avatar_url: session && profile ? Profiler.avatar_url : '',
        })
    }, [session, setUser, profile])
    
    return(
        <header className="shadow-lg shadow-gray-100">
            <div className="py-5 container max-w-screen-sm mx-auto flex items-center justify-between">
                <Link href="/" className="font-bold text-xl cursor-pointer">
                bookmark-manager
                </Link>

                <div className="text-sm font-bold">
                    {session ? (
                        <div className="flex items-center space-x-5">
                            <Link href="/setings/profile">
                            <div>プロフィール</div>
                            </Link>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-5">
                            <Link href="/auth/login">ログイン</Link>
                            <Link href="/auth/signup">サインアップ</Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}

export default Navigation