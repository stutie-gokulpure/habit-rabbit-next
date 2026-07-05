interface FormInputProps {
  label?: string
  type: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  required?: boolean
  labelClassName?: string
}

export function FormInput({ label, type, value, onChange, required = true, labelClassName }: FormInputProps) {
  return (
    <div>
      {label && (
        <label className={labelClassName || 'block text-sm font-medium mb-2 text-gray-900'}>{label}</label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 bg-white text-gray-900"
        style={{ '--tw-ring-color': '#1D9E75' } as React.CSSProperties}
        required={required}
      />
    </div>
  )
}
