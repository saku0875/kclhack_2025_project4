'use client'

import Link from 'next/link'
import useStore from '@/store'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import type { Session } from '@supabase/supabase-js'
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
    const pathname = usePathname() // 追加
    
    // ログインページかどうかを判定
    const isLoginPage = pathname === '/' && !session // 追加

    // 状態管理にユーザ情報を保存
    useEffect(() => {
        setUser({
            id: session ? session.user.id : '',
            email: session ? session.user.email! : '',
            name: session && profile ? profile.name : '',
            introduce: session && profile ? profile.introduce : '',
            avatar_url: session && profile ? profile.avatar_url : '',
        })
    }, [session, setUser, profile])
    
    return(
        <header className="shadow-lg shadow-gray-100">
            <div className={`py-5 container max-w-7xl mx-auto sm:px-6 lg:px-8 flex items-center ${
                isLoginPage ? 'justify-center' : 'justify-between'
            }`}>
                <Link href="/" className="font-bold text-xl hover:text-blue-600 transition-colors cursor-pointer">
                Bookmark-manager
                </Link>

                {!isLoginPage && (
                    <div className="text-sm font-bold">
                        {session ? (
                            <div className="flex items-center space-x-5">
                                <Link href="/settings/profile">
                                <div className="relative w-10 h-10">
                                    <Image
                                      src={profile && profile.avatar_url ? profile.avatar_url : '/default.png'}
                                      className="rounded-full object-cover"
                                      alt="avatar"
                                      fill
                                      />
                                </div>
                                </Link>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-5">
                            </div>
                        )}
                    </div>
                )}
            </div>
        </header>
    )
}

export default Navigation