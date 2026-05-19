interface FormButtonProps {
  children: React.ReactNode
  disabled: boolean
  type?: 'submit' | 'button'
}

export function FormButton({ children, disabled, type = 'submit' }: FormButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      className="w-full text-white py-2 rounded-lg font-semibold disabled:opacity-50 transition-opacity hover:opacity-90 dark:hover:opacity-80"
      style={{ background: '#1D9E75' }}
    >
      {children}
    </button>
  )
}
