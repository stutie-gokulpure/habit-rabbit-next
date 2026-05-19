'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { AuthCard } from '@/components/ui'
import { SignInForm } from '@/components/auth/SignInForm'
import { SignUpForm } from '@/components/auth/SignUpForm'
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'

export default function AuthPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/reset`,
        })
        if (error) throw error
        setMessage('Check your email for a password reset link')
        setEmail('')
      } else if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMessage('Check your email to confirm your account')
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push('/app')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Auth failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard>
      <form onSubmit={handleAuth} className="space-y-4">
        {isForgotPassword ? (
          <ForgotPasswordForm
            email={email}
            setEmail={setEmail}
            loading={loading}
            error={error}
            message={message}
            onSubmit={handleAuth}
            onBack={() => setIsForgotPassword(false)}
          />
        ) : isSignUp ? (
          <SignUpForm
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            loading={loading}
            error={error}
            message={message}
            onSubmit={handleAuth}
            onSwitchToSignIn={() => setIsSignUp(false)}
          />
        ) : (
          <SignInForm
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            loading={loading}
            error={error}
            onSubmit={handleAuth}
            onForgotPassword={() => setIsForgotPassword(true)}
            onSwitchToSignUp={() => setIsSignUp(true)}
          />
        )}
      </form>
    </AuthCard>
  )
}
