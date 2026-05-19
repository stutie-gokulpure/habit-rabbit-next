import { FormInput, FormButton, FormMessage } from '@/components/ui'

interface ResetPasswordFormProps {
  password: string
  setPassword: (password: string) => void
  confirmPassword: string
  setConfirmPassword: (password: string) => void
  loading: boolean
  error: string
  message: string
  onSubmit: (e: React.FormEvent) => void
}

export function ResetPasswordForm({
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  loading,
  error,
  message,
  onSubmit,
}: ResetPasswordFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4 bg-white p-8 rounded-lg shadow">
      <FormInput label="New Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <FormInput
        label="Confirm Password"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      {error && <FormMessage message={error} type="error" />}
      {message && <FormMessage message={message} type="success" />}
      <FormButton disabled={loading}>{loading ? 'Resetting...' : 'Reset Password'}</FormButton>
    </form>
  )
}
