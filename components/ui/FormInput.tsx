interface FormInputProps {
  label: string
  type: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean
}

export function FormInput({ label, type, value, onChange, required = true }: FormInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2 dark:text-gray-100">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
        style={{ '--tw-ring-color': '#1D9E75' } as React.CSSProperties}
        required={required}
      />
    </div>
  )
}
