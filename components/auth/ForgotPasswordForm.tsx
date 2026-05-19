import { FormInput, FormButton, FormMessage } from '@/components/ui'

interface ForgotPasswordFormProps {
  email: string
  setEmail: (email: string) => void
  loading: boolean
  error: string
  message: string
  onSubmit: (e: React.FormEvent) => void
  onBack: () => void
}

export function ForgotPasswordForm({
  email,
  setEmail,
  loading,
  error,
  message,
  onSubmit,
  onBack,
}: ForgotPasswordFormProps) {
  return (
    <>
      <form onSubmit={onSubmit} className="space-y-4 bg-white p-8 rounded-lg shadow">
        <FormInput label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        {error && <FormMessage message={error} type="error" />}
        {message && <FormMessage message={message} type="success" />}
        <FormButton disabled={loading}>{loading ? 'Loading...' : 'Send Reset Email'}</FormButton>
      </form>

      <div className="text-center mt-4">
        <button onClick={onBack} className="text-sm text-gray-600 hover:text-gray-900">
          Back to sign in
        </button>
      </div>
    </>
  )
}
