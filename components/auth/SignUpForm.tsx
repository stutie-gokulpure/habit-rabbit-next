import { FormInput, FormButton, FormMessage } from '@/components/ui'

interface SignUpFormProps {
  email: string
  setEmail: (email: string) => void
  password: string
  setPassword: (password: string) => void
  loading: boolean
  error: string
  message: string
  onSubmit: (e: React.FormEvent) => void
  onSwitchToSignIn: () => void
}

export function SignUpForm({
  email,
  setEmail,
  password,
  setPassword,
  loading,
  error,
  message,
  onSubmit,
  onSwitchToSignIn,
}: SignUpFormProps) {
  return (
    <>
      <form onSubmit={onSubmit} className="space-y-4 bg-white p-8 rounded-lg shadow">
        <FormInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <FormInput label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <FormMessage message={error} type="error" />}
        {message && <FormMessage message={message} type="success" />}
        <FormButton disabled={loading}>{loading ? 'Loading...' : 'Sign Up'}</FormButton>
      </form>

      <div className="text-center mt-4">
        <button onClick={onSwitchToSignIn} className="text-sm text-gray-600 hover:text-gray-900">
          Already have an account? Sign in
        </button>
      </div>
    </>
  )
}
