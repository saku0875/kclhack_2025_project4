import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

type Database = {
  public: {
    Tables: Record<string, { Row: any; Insert: any; Update: any }>
    Views: Record<string, any>
    Functions: Record<string, any>
  }
}

// メインページ
const Home = async () => {
  const cookieStore = await cookies()
  
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          // Server Componentでは何もしない（警告を避けるため）
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Componentでは無視
          }
        },
      },
    }
  )

  //　セッションの所得
  const {
    data: { session },
  } = await supabase.auth.getSession()
  
  return (
    <div className="text-center text-xl">
      {session ? <div>ログイン済</div> : <div>未ログイン</div>}
    </div>
  )
}

export default Home