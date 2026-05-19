interface FormMessageProps {
  message: string
  type: 'error' | 'success'
}

export function FormMessage({ message, type }: FormMessageProps) {
  const colorClass = type === 'error' ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
  return <div className={`${colorClass} text-sm`}>{message}</div>
}
