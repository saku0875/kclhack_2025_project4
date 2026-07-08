import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import AnimatedAuthForm from '@/src/app/components/AnimatedAuthForm'

const Home = async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/auth/dashboard')
  }

  return (
    <div className="text-center text-xl">
      <AnimatedAuthForm />
    </div>
  )
}

export default Home
