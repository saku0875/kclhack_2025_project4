'use client'

import { createClient } from '@/lib/supabase'

export default function AuthButtons() {
  const supabase = createClient()

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    })
  }

  const signInWithGitHub = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${location.origin}/auth/callback`
      }
    })
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <div className="flex flex-col gap-4">
      <button 
        onClick={signInWithGoogle}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Googleでログイン
      </button>
      <button 
        onClick={signInWithGitHub}
        className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900"
      >
        GitHubでログイン
      </button>
    </div>
  )
}