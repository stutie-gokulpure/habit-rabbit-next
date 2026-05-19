import { FormInput, FormButton, FormMessage } from '@/components/ui'

interface SignInFormProps {
  email: string
  setEmail: (email: string) => void
  password: string
  setPassword: (password: string) => void
  loading: boolean
  error: string
  onSubmit: (e: React.FormEvent) => void
  onForgotPassword: () => void
  onSwitchToSignUp: () => void
}

export function SignInForm({
  email,
  setEmail,
  password,
  setPassword,
  loading,
  error,
  onSubmit,
  onForgotPassword,
  onSwitchToSignUp,
}: SignInFormProps) {
  return (
    <>
      <form onSubmit={onSubmit} className="space-y-4 bg-white p-8 rounded-lg shadow">
        <FormInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <FormInput label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <FormMessage message={error} type="error" />}
        <FormButton disabled={loading}>{loading ? 'Loading...' : 'Sign In'}</FormButton>
      </form>

      <div className="text-center mt-4 space-y-2">
        <button onClick={onForgotPassword} className="block w-full text-sm text-gray-600 hover:text-gray-900">
          Forgot your password?
        </button>
        <button onClick={onSwitchToSignUp} className="text-sm text-gray-600 hover:text-gray-900">
          Don't have an account? Sign up
        </button>
      </div>
    </>
  )
}
