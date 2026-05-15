'use client'

  import { useEffect, useState } from 'react'
  import { useRouter } from 'next/navigation'
  import { supabase } from '@/lib/supabase'

  export default function AppPage() {
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
  
    useEffect(() => {
      const getUser = async () => {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user)
      }
  
      getUser()
    }, [])

    const handleLogout = async () => {
      await supabase.auth.signOut()
      router.push('/auth')
    }
  
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">🐰 Habits</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Logout
            </button>
          </div>
          <p className="text-gray-600">Welcome, {user?.email}</p>
          <p className="text-gray-400 mt-4">Habit list coming next...</p>
        </div>
      </div>
    )
  } 