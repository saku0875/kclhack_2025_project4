'use client'

import Link from 'next/link'
import useStore from '@/store'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import type { User } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'
type ProfileType = Database['public']['Tables']['profiles']['Row']

const Navigation = ({
  user,
  profile,
}: {
  user: User | null
  profile: ProfileType | null
}) => {
  const { setUser } = useStore()
  const pathname = usePathname()

  const isLoginPage = pathname === '/' && !user

  useEffect(() => {
    setUser({
      id: user ? user.id : '',
      email: user ? user.email! : '',
      name: user && profile ? profile.name : '',
      introduce: user && profile ? profile.introduce : '',
      avatar_url: user && profile ? profile.avatar_url : '',
    })
  }, [user, setUser, profile])

  return (
    <header className="shadow-lg shadow-gray-100">
      <div className={`py-5 container max-w-7xl mx-auto sm:px-6 lg:px-8 flex items-center ${
        isLoginPage ? 'justify-center' : 'justify-between'
      }`}>
        <Link href="/" className="font-bold text-xl hover:text-blue-600 transition-colors cursor-pointer">
          Bookmark-manager
        </Link>

        {!isLoginPage && (
          <div className="text-sm font-bold">
            {user ? (
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
              <div className="flex items-center space-x-5" />
            )}
          </div>
        )}
      </div>
    </header>
  )
}

export default Navigation
