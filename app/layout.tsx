'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import "./globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('Layout mounted, pathname:', pathname)
    
    const checkAuth = async () => {
      try {
        console.log('Checking auth...')
        const { data: { session }, error } = await supabase.auth.getSession()
        console.log('Session:', session, 'Error:', error)
        
        if (!session && !pathname.startsWith('/auth')) {
          console.log('No session, pushing to /auth')
          router.push('/auth')
        }
      } catch (err) {
        console.error('Auth check error:', err)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', session)
    })

    return () => subscription?.unsubscribe()
  }, [pathname, router])

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
